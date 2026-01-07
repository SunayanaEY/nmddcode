import {
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { feature as topojsonFeature } from 'topojson-client';
import { StateData } from '../../public-dashboard.component';
import {
  DashboardDataService,
  InstituteLocationData,
} from '../../services/dashboard-data.service';
import { TranslateModule } from '@ngx-translate/core';

interface InstituteMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  trainingConducted: number;
  traineesCount: number;
}

@Component({
  selector: 'app-india-map',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './india-map.component.html',
  styleUrls: ['./india-map.component.css'],
})
export class IndiaMapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() selectedState: StateData | null = null;
  @Input() isLoading = false;
  @Input() organizationId: number | null = null;
  @Input() instituteType: string | null = null;
  @Input() variant: 'default' | 'login' = 'default';
  @Output() stateSelected = new EventEmitter<StateData | null>();

  private svg: any;
  private g: any;
  private projection: any;
  private path: any;
  private zoom: any;
  private width = 500;
  private height = 400;
  userRole: number = 0;
  private userStateName: string = '';

  // Institute data from API
  private institutes: InstituteMarker[] = [];

  // Mock state data
  private statesData: { [key: string]: StateData } = {
    UP: { stateId: 'UP', stateName: 'Uttar Pradesh' },
    MH: { stateId: 'MH', stateName: 'Maharashtra' },
    KA: { stateId: 'KA', stateName: 'Karnataka' },
    TN: { stateId: 'TN', stateName: 'Tamil Nadu' },
    WB: { stateId: 'WB', stateName: 'West Bengal' },
    RJ: { stateId: 'RJ', stateName: 'Rajasthan' },
    GJ: { stateId: 'GJ', stateName: 'Gujarat' },
    TS: { stateId: 'TS', stateName: 'Telangana' },
    DL: { stateId: 'DL', stateName: 'Delhi' },
    KL: { stateId: 'KL', stateName: 'Kerala' },
  };

  isStateView = false;
  private currentStateName: string | null = null;

  private stateTopoFileMap: { [key: string]: string } = {
    'Andaman and Nicobar Islands': 'andaman-and-nicobar-islands',
    'Andhra Pradesh': 'andhra-pradesh',
    'Arunachal Pradesh': 'arunachal-pradesh',
    'Assam': 'assam',
    'Bihar': 'bihar',
    'Chandigarh': 'chandigarh',
    'Chhattisgarh': 'chhattisgarh',
    'Delhi': 'delhi',
    'Dadra and Nagar Haveli and Daman and Diu': 'dnh-and-dd',
    'Goa': 'goa',
    'Gujarat': 'gujarat',
    'Haryana': 'haryana',
    'Himachal Pradesh': 'himachal-pradesh',
    'Jammu and Kashmir': 'jammu-and-kashmir',
    'Jharkhand': 'jharkhand',
    'Karnataka': 'karnataka',
    'Kerala': 'kerala',
    'Ladakh': 'ladakh',
    'Lakshadweep': 'lakshadweep',
    'Madhya Pradesh': 'madhya-pradesh',
    'Maharashtra': 'maharashtra',
    'Manipur': 'manipur',
    'Meghalaya': 'meghalaya',
    'Mizoram': 'mizoram',
    'Nagaland': 'nagaland',
    'Odisha': 'odisha',
    'Puducherry': 'puducherry',
    'Punjab': 'punjab',
    'Rajasthan': 'rajasthan',
    'Sikkim': 'sikkim',
    'Tamil Nadu': 'tamilnadu',
    'Telangana': 'telangana',
    'Tripura': 'tripura',
    'Uttar Pradesh': 'uttar-pradesh',
    'Uttarakhand': 'uttarakhand',
    'West Bengal': 'west-bengal',
  };

  constructor(private dashboardService: DashboardDataService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState']) {
      const next = changes['selectedState'].currentValue as StateData | null;
      if (next && next.stateName) {
        const topoPath = this.getStateTopoJsonPath(next.stateName);
        if (topoPath && this.svg && this.g) {
          this.loadAndRenderStateMap(topoPath, next.stateName);
        }
      } else if (!next && this.isStateView && this.svg && this.g) {
        this.backToIndia();
      }
    }

    if (changes['organizationId'] || changes['instituteType']) {
      this.loadInstituteData();
    }
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.loadInstituteData();
  }

  private checkUserRole(): void {
    try {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.userRole = user.role || 0;
        this.userStateName = user.stateName || '';
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  private loadInstituteData(): void {
    this.dashboardService.getInstituteLocations(this.organizationId || undefined, this.instituteType || undefined).subscribe({
      next: (data: InstituteLocationData[]) => {
        this.institutes = data.map((institute) => ({
          id: institute.id,
          name: institute.name,
          latitude: institute.latitude,
          longitude: institute.longitude,
          address: institute.address,
          trainingConducted: institute.trainingConducted || 0,
          traineesCount: institute.traineesCount || 0,
        }));
        // Re-render markers if map is already initialized
        if (this.g) {
          this.addInstituteMarkers();
        }
      },
      error: (error) => {
        console.error('❌ Error loading institute data:', error);
      },
    });
  }

  ngAfterViewInit(): void {
    // Check if we can initialize immediately or need to wait for loading to complete
    if (!this.isLoading) {
      this.initializeMapWhenReady();
    } else {
      // Watch for isLoading to become false
      this.waitForLoadingComplete();
    }
  }

  private waitForLoadingComplete(): void {
    const checkLoading = () => {
      if (!this.isLoading) {
        this.initializeMapWhenReady();
      } else {
        setTimeout(checkLoading, 100);
      }
    };
    setTimeout(checkLoading, 100);
  }

  private initializeMapWhenReady(): void {
    // Add a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      if (this.mapContainer && this.mapContainer.nativeElement) {
        this.initializeMap();
      } else {
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
  }

  private initializeMap(): void {
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      return;
    }

    const container = this.mapContainer.nativeElement;

    const rect = container.getBoundingClientRect();

    this.width = rect.width || 500;
    this.height = rect.height || 400;

    // Create SVG
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr(
        'preserveAspectRatio',
        this.variant === 'login' ? 'xMidYMid slice' : 'xMidYMid meet'
      );

    if (this.variant === 'login') {
      this.svg
        .style('background', 'transparent');
    } else {
      this.svg
        .style('background', 'rgba(255, 255, 255, 0.08)')
        .style('backdrop-filter', 'blur(25px)');
    }

    // Create main group
    this.g = this.svg.append('g');

    // Setup projection
    this.projection = d3
      .geoMercator()
      .center([70.9629, 15.5937]) // Center of India
      .scale(500)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath().projection(this.projection);

    // Setup zoom
    this.zoom = d3
      .zoom()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    // Load the India map data
    this.loadIndiaMap();
  }

  private async loadIndiaMap(): Promise<void> {
    try {
      const response = await fetch('assets/geoJsonData/India.geojson');

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }

      const geoData = await response.json();

      this.createMapFromGeoJSON(geoData);
      this.addInstituteMarkers();
    } catch (error) {
      const errorObj = error as Error;

      this.createSimplifiedIndiaMap();
      this.addInstituteMarkers();
    }
  }

  private createMapFromGeoJSON(geoData: any): void {
    // Use fitExtent to match SVG size and preserve aspect
    this.projection = d3
      .geoMercator()
      .fitExtent(
        this.variant === 'login'
          ? [[0, 0], [this.width, this.height]]
          : [[10, 10], [this.width - 10, this.height - 10]],
        geoData
      );

    this.path = d3.geoPath().projection(this.projection);

    // Create separate groups for proper layering
    this.g.select('.states-group').remove();
    let statesGroup = this.g.select('.states-group');
    if (statesGroup.empty()) {
      statesGroup = this.g.append('g').attr('class', 'states-group');
    }

    const stateSelection = statesGroup
      .selectAll('.state')
      .data(geoData.features);

    const baseFill = this.variant === 'login' ? '#dbdee2' : '#24a8efde';
    const baseStroke = this.variant === 'login' ? '#9a9999a9' : '#211e1ea6';
    const hoverFill = this.variant === 'login' ? '#c2c2c2ff' : '#6188afff';

    stateSelection
      .join('path')
      .attr('class', 'state')
      .attr('d', (d: any) => this.path(d))
      .attr('fill', baseFill)
      .attr('stroke', baseStroke)
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget).attr('fill', hoverFill);
        const stateName = d.properties.NAME || d.properties.name || 'Unknown State';
        this.showTooltip(event, stateName);
      })
      .on('mouseout', (event: any) => {
        d3.select(event.currentTarget).attr('fill', baseFill);
        this.hideTooltip();
      })
      .on('click', (event: any, d: any) => {
        const stateName = d.properties.NAME || d.properties.name;
        this.handleIndiaStateClick(stateName);
      });

    // Apply role-based zooming after map is created
    setTimeout(() => {
      this.applyRoleBasedZoom(geoData);
      // If parent passed a selectedState, render it
      if (this.selectedState && this.selectedState.stateName) {
        const path = this.getStateTopoJsonPath(this.selectedState.stateName);
        if (path) {
          this.loadAndRenderStateMap(path, this.selectedState.stateName);
        } else {
          this.zoomToState(geoData, this.selectedState.stateName);
        }
      }
    }, 100);
  }

  private renderStateGeoJSON(geo: any): void {
    // Remove old group entirely to avoid stale transforms
    this.g.select('.states-group').remove();

    // Fit projection to state extent with margin
    this.projection = d3.geoMercator().fitExtent([[10, 10], [this.width - 10, this.height - 10]], geo);
    this.path = d3.geoPath().projection(this.projection);

    // Create fresh group
    const statesGroup = this.g.append('g').attr('class', 'states-group');

    const features = geo.features || (geo.type === 'FeatureCollection' ? geo.features : [geo]);

    statesGroup
      .selectAll('.state')
      .data(features)
      .join('path')
      .attr('class', 'state fade-in')
      .attr('d', (d: any) => this.path(d))
      .attr('fill', this.variant === 'login' ? '#f9fafb' : '#24a8efde')
      .attr('stroke', this.variant === 'login' ? '#cbd5e1' : '#211e1ea6')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .style('opacity', 0)
      .on('mouseover', (event: any, d: any) => {
        const hoverFill = this.variant === 'login' ? '#e5e7eb' : '#6188afff';
        d3.select(event.currentTarget).attr('fill', hoverFill);
        const districtName = d.properties?.district || d.properties?.name || this.currentStateName || '';
        this.showTooltip(event, districtName);
      })
      .on('mouseout', (event: any) => {
        const baseFill = this.variant === 'login' ? '#f9fafb' : '#24a8efde';
        d3.select(event.currentTarget).attr('fill', baseFill);
        this.hideTooltip();
      })
      .transition()
      .duration(500)
      .style('opacity', 1);

    // Reset any zoom transform for a clean view
    this.resetZoom();
  }

  private handleIndiaStateClick(stateName: string): void {
    // Emit existing event for supported states to maintain functionality
    const stateCode = this.getStateCodeFromName(stateName);
    if (stateCode && this.statesData[stateCode]) {
      this.stateSelected.emit(this.statesData[stateCode]);
    }

    const topoPath = this.getStateTopoJsonPath(stateName);
    if (topoPath) {
      this.loadAndRenderStateMap(topoPath, stateName);
    } else {
      // Fallback: just zoom to the state on India map
      this.currentStateName = stateName;
    }
  }

  private normalizeStateName(name: string): string {
    return name
      .replace(/\u0026|&/g, 'and')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getStateTopoJsonPath(stateName: string): string | null {
    const normalized = this.normalizeStateName(stateName);
    const key = Object.keys(this.stateTopoFileMap).find(
      (k) => this.normalizeStateName(k).toLowerCase() === normalized.toLowerCase()
    );
    if (!key) {
      // Handle common alias
      if (normalized.toLowerCase().includes('nct') && normalized.toLowerCase().includes('delhi')) {
        return 'assets/geoJsonData/topojson/states/delhi.json';
      }
      return null;
    }
    const fileSlug = this.stateTopoFileMap[key];
    return `assets/geoJsonData/topojson/states/${fileSlug}.json`;
  }

  private async loadAndRenderStateMap(topoPath: string, stateName: string): Promise<void> {
    try {
      this.isStateView = true;
      this.currentStateName = stateName;

      const response = await fetch(topoPath);
      if (!response.ok) {
        throw new Error(`Failed to load ${topoPath}: ${response.statusText}`);
      }
      const topology = await response.json();
      const objects: any = (topology as any).objects;
      const firstKey = Object.keys(objects)[0];
      const objectForFeatures = objects['districts'] ?? objects['features'] ?? objects['states'] ?? objects[firstKey];
      const featureCollection: any = topojsonFeature(topology as any, objectForFeatures as any);

      this.renderStateGeoJSON(featureCollection);
      this.addInstituteMarkers();
    } catch (err) {
      console.error('Error loading state topojson:', err);
    }
  }


  backToIndia(): void {
    this.isStateView = false;
    this.currentStateName = null;

    // Inform parent to clear selected state label
    this.stateSelected.emit(null);

    // Clear existing states and re-load India map
    this.g.select('.states-group').selectAll('path').remove();
    this.loadIndiaMap();
    this.resetZoom();
  }

  private applyRoleBasedZoom(geoData: any): void {
    if (this.userRole === 5 && this.userStateName) {
      // State admin - open state map view instead of zooming
      const topoPath = this.getStateTopoJsonPath(this.userStateName);
      if (topoPath) {
        this.loadAndRenderStateMap(topoPath, this.userStateName);
      } else {
        // Fallback: if topo not found, keep previous behavior
        this.zoomToState(geoData, this.userStateName);
      }
    } else if (this.userRole === 1) {
      // Center admin - show full India map (already default view)
    }
  }

  private zoomToState(geoData: any, stateName: string): void {
    // Find the state feature in GeoJSON data
    const stateFeature = geoData.features.find((feature: any) => {
      const featureName =
        feature.properties.NAME || feature.properties.name || '';
      return (
        featureName.toLowerCase().includes(stateName.toLowerCase()) ||
        stateName.toLowerCase().includes(featureName.toLowerCase())
      );
    });

    if (stateFeature && this.svg && this.g) {
      // Calculate bounds of the state
      const bounds = this.path.bounds(stateFeature);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;

      // Calculate scale and translate for zooming
      const scale = Math.min(
        8,
        0.9 / Math.max(dx / this.width, dy / this.height)
      );
      const translate = [
        this.width / 2 - scale * x,
        this.height / 2 - scale * y,
      ];

      // Apply zoom transformation
      const transform = d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale);

      this.svg.transition().duration(1000).call(this.zoom.transform, transform);
    } else {
      console.warn('State feature not found for:', stateName);
    }
  }

  private getStateCodeFromName(stateName: string): string | null {
    const stateMapping: { [key: string]: string } = {
      'Uttar Pradesh': 'UP',
      Maharashtra: 'MH',
      Karnataka: 'KA',
      'Tamil Nadu': 'TN',
      'West Bengal': 'WB',
      Rajasthan: 'RJ',
      Gujarat: 'GJ',
      Telangana: 'TS',
      Delhi: 'DL',
      Kerala: 'KL',
    };
    return stateMapping[stateName] || null;
  }

  private createSimplifiedIndiaMap(): void {
    // Simplified state boundaries (you would replace this with actual TopoJSON data)
    const states = [
      {
        name: 'Uttar Pradesh',
        code: 'UP',
        path: 'M200,150 L300,150 L300,200 L200,200 Z',
      },
      {
        name: 'Maharashtra',
        code: 'MH',
        path: 'M150,250 L250,250 L250,300 L150,300 Z',
      },
      {
        name: 'Karnataka',
        code: 'KA',
        path: 'M200,320 L280,320 L280,380 L200,380 Z',
      },
      {
        name: 'Tamil Nadu',
        code: 'TN',
        path: 'M220,390 L300,390 L300,450 L220,450 Z',
      },
      {
        name: 'West Bengal',
        code: 'WB',
        path: 'M350,200 L420,200 L420,280 L350,280 Z',
      },
      {
        name: 'Rajasthan',
        code: 'RJ',
        path: 'M100,100 L200,100 L200,180 L100,180 Z',
      },
      {
        name: 'Gujarat',
        code: 'GJ',
        path: 'M50,200 L150,200 L150,280 L50,280 Z',
      },
      {
        name: 'Telangana',
        code: 'TS',
        path: 'M250,280 L320,280 L320,340 L250,340 Z',
      },
      {
        name: 'Delhi',
        code: 'DL',
        path: 'M180,120 L200,120 L200,140 L180,140 Z',
      },
    ];

    // Create states group for proper layering
    const statesGroup = this.g.append('g').attr('class', 'states-group');

    // Add states to the states group
    const stateSelection = statesGroup
      .selectAll('.state')
      .data(states)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', (d: any) => {
        return d.path;
      })
      .attr('fill', this.variant === 'login' ? '#f9fafb' : '#ffd54f')
      .attr('stroke', this.variant === 'login' ? '#cbd5e1' : '#ff8f00')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        this.onStateHover(event, d);
      })
      .on('mouseout', () => this.onStateHoverOut())
      .on('click', (event: any, d: any) => {
        this.onStateClick(d);
      });
  }

  private addInstituteMarkers(): void {
    // Remove existing markers group to recreate it (ensures it's on top)
    this.g.select('.markers-group').remove();

    // Create a separate group for markers to ensure they appear on top of states
    const markersGroup = this.g.append('g').attr('class', 'markers-group');

    // Add institute markers to the markers group
    const markerSelection = markersGroup
      .selectAll('.institute-marker-group') // Changed selection class
      .data(this.institutes);

    const markerEnter = markerSelection
      .enter()
      .append('g')
      .attr('class', 'institute-marker-group')
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: InstituteMarker) => {
        // For login variant, scale up the pin
        if (this.variant === 'login') {
           d3.select(event.currentTarget).transition().duration(200).attr('transform', (t: any) => {
              // Re-calculate position to maintain it, but add scale
              const coords = this.projection ? this.projection([d.longitude, d.latitude]) : [this.width/2, this.height/2];
              const x = coords ? coords[0] : this.width/2;
              const y = coords ? coords[1] : this.height/2;
              return `translate(${x},${y}) scale(1.2)`;
           });
        }
        this.onInstituteHover(event, d);
      })
      .on('mouseout', (event: any, d: InstituteMarker) => {
        if (this.variant === 'login') {
           d3.select(event.currentTarget).transition().duration(200).attr('transform', (t: any) => {
              const coords = this.projection ? this.projection([d.longitude, d.latitude]) : [this.width/2, this.height/2];
              const x = coords ? coords[0] : this.width/2;
              const y = coords ? coords[1] : this.height/2;
              return `translate(${x},${y}) scale(1)`;
           });
        }
        this.hideTooltip();
      });

    // Position the groups
    markerEnter.attr('transform', (d: InstituteMarker) => {
      let x = this.width / 2;
      let y = this.height / 2;

      if (this.projection) {
        const coords = this.projection([d.longitude, d.latitude]);
        if (coords) {
          x = coords[0];
          y = coords[1];
        }
      }
      return `translate(${x}, ${y})`;
    });

    if (this.variant === 'login') {
      // Pin Path (Blue teardrop)
      // Path centered at bottom tip (0,0)
      markerEnter.append('path')
        .attr('d', 'M0,0 C-6,-10 -10,-16 -10,-21 C-10,-26.5 -5.5,-31 0,-31 C5.5,-31 10,-26.5 10,-21 C10,-16 6,-10 0,0 Z')
        .attr('fill', '#2563eb') // Bootstrap primary blue
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Inner White Dot
      markerEnter.append('circle')
        .attr('cy', -21) // Position in the head of the pin
        .attr('r', 3.5)
        .attr('fill', '#ffffff');
    } else {
      // Dashboard variant - existing red circles
      markerEnter.append('circle')
        .attr('class', 'institute-marker')
        .attr('r', 2)
        .attr('fill', '#ff5722')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);
    }
  }

  private createFallbackMap(): void {
    // Fallback: Simple rectangle representing India
    this.g
      .append('rect')
      .attr('x', 50)
      .attr('y', 50)
      .attr('width', this.width - 100)
      .attr('height', this.height - 100)
      .attr('fill', '#ffd54f')
      .attr('stroke', '#ff8f00')
      .attr('stroke-width', 1)
      .attr('rx', 10);

    this.g
      .append('text')
      .attr('x', this.width / 2)
      .attr('y', this.height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .text('India Map');
  }

  private onStateHover(event: any, stateData: any): void {
    // Highlight state
    d3.select(event.target).attr('fill', '#ffcc02').attr('stroke-width', 1);

    this.showTooltip(event, stateData.name);
  }

  private onStateHoverOut(): void {
    // Reset state appearance
    this.g.selectAll('.state').attr('fill', '#ffd54f').attr('stroke-width', 1);

    this.hideTooltip();
  }

  private onStateClick(stateData: any): void {
    const state = this.statesData[stateData.code];
    if (state) {
      this.stateSelected.emit(state);
    }
  }

  private onInstituteHover(event: any, institute: InstituteMarker): void {
    const trainingConducted = institute.trainingConducted ?? 0;
    const traineesCount = institute.traineesCount ?? 0;
    const tooltipContent = `${institute.name}\n${institute.address}\nTrainings Conducted: ${trainingConducted}\nTrainees Count: ${traineesCount}`;
    this.showTooltip(event, tooltipContent);
  }

  private showTooltip(event: any, text: string): void {
    const tooltip = d3.select('body').selectAll('.map-tooltip').data([0]);

    const tooltipEnter = tooltip
      .enter()
      .append('div')
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('opacity', 0);

    tooltip
      .merge(tooltipEnter as any)
      .html(text.replace(/\n/g, '<br>'))
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 10 + 'px')
      .transition()
      .duration(200)
      .style('opacity', 1);
  }

  private hideTooltip(): void {
    d3.select('body')
      .selectAll('.map-tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove();
  }

  resetZoom(): void {
    this.svg
      .transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }
}
