import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { StateData } from '../../public-dashboard.component';
import { DashboardDataService, InstituteLocationData } from '../../services/dashboard-data.service';
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
  imports: [CommonModule,TranslateModule],
  templateUrl: './india-map.component.html',
  styleUrls: ['./india-map.component.css']
})
export class IndiaMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  @Input() selectedState: StateData | null = null;
  @Input() isLoading = false;
  @Output() stateSelected = new EventEmitter<StateData>();

  private svg: any;
  private g: any;
  private projection: any;
  private path: any;
  private zoom: any;
  private width = 500;
  private height = 400;
  private userRole: number = 0;
  private userStateName: string = '';

  // Institute data from API
  private institutes: InstituteMarker[] = [];

  // Mock state data
  private statesData: { [key: string]: StateData } = {
    'UP': { stateId: 'UP', stateName: 'Uttar Pradesh' },
    'MH': { stateId: 'MH', stateName: 'Maharashtra' },
    'KA': { stateId: 'KA', stateName: 'Karnataka' },
    'TN': { stateId: 'TN', stateName: 'Tamil Nadu' },
    'WB': { stateId: 'WB', stateName: 'West Bengal' },
    'RJ': { stateId: 'RJ', stateName: 'Rajasthan' },
    'GJ': { stateId: 'GJ', stateName: 'Gujarat' },
    'TS': { stateId: 'TS', stateName: 'Telangana' },
    'DL': { stateId: 'DL', stateName: 'Delhi' }
  };

  constructor(private dashboardService: DashboardDataService) {}

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
    this.dashboardService.getInstituteLocations().subscribe({
      next: (data: InstituteLocationData[]) => {
        this.institutes = data.map(institute => ({
          id: institute.id,
          name: institute.name,
          latitude: institute.latitude,
          longitude: institute.longitude,
          address: institute.address,
          trainingConducted: institute.trainingConducted || 0,
          traineesCount: institute.traineesCount || 0
        }));
        // Re-render markers if map is already initialized
        if (this.g) {
          this.addInstituteMarkers();
        }
      },
      error: (error) => {
        console.error('❌ Error loading institute data:', error);
      }
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
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      //.style('background', '#f8f9fa');
      .style('background','rgba(255, 255, 255, 0.08)')
      .style('backdrop-filter','blur(25px)');

    // Create main group
    this.g = this.svg.append('g');

    // Setup projection
    this.projection = d3.geoMercator()
      .center([70.9629, 15.5937]) // Center of India
      .scale(500)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath().projection(this.projection);

    // Setup zoom
    this.zoom = d3.zoom()
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
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
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


    // Set up projection for India
    this.projection = d3.geoMercator()
      .center([82.9629, 20.5937]) // Center of India
      .scale(650)
      .translate([this.width / 2, this.height / 2]);
    

    this.path = d3.geoPath().projection(this.projection);

    // Create separate groups for proper layering
    let statesGroup = this.g.select('.states-group');
    if (statesGroup.empty()) {
      statesGroup = this.g.append('g').attr('class', 'states-group');
    }

    // Draw states/features from GeoJSON in the states group
    const stateSelection = statesGroup.selectAll('.state')
      .data(geoData.features);

    const stateEnter = stateSelection.enter()
      .append('path')
      .attr('class', 'state');

    stateEnter
      .attr('d', (d: any) => {
        const pathData = this.path(d);
        return pathData;
      })
      .attr('fill', '#ffd54f')
      .attr('stroke', '#ff8f00')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget).attr('fill', '#ffcc02');
        const stateName = d.properties.NAME || d.properties.name || 'Unknown State';
        this.showTooltip(event, stateName);
      })
      .on('mouseout', (event: any) => {
        d3.select(event.currentTarget).attr('fill', '#ffd54f');
        this.hideTooltip();
      })
      .on('click', (event: any, d: any) => {
        const stateName = d.properties.NAME || d.properties.name;
        // Find matching state data
        const stateCode = this.getStateCodeFromName(stateName);
        if (stateCode && this.statesData[stateCode]) {
          this.stateSelected.emit(this.statesData[stateCode]);
        }
      });


    // Apply role-based zooming after map is created
    setTimeout(() => {
      this.applyRoleBasedZoom(geoData);
    }, 100);

  }

  private applyRoleBasedZoom(geoData: any): void {

    if (this.userRole === 5 && this.userStateName) {
      // State admin - zoom to specific state
      this.zoomToState(geoData, this.userStateName);
    } else if (this.userRole === 1) {
      // Center admin - show full India map (already default view)
    }
  }

  private zoomToState(geoData: any, stateName: string): void {

    // Find the state feature in GeoJSON data
    const stateFeature = geoData.features.find((feature: any) => {
      const featureName = feature.properties.NAME || feature.properties.name || '';
      return featureName.toLowerCase().includes(stateName.toLowerCase()) ||
             stateName.toLowerCase().includes(featureName.toLowerCase());
    });

    if (stateFeature && this.svg && this.g) {

      // Calculate bounds of the state
      const bounds = this.path.bounds(stateFeature);
      const dx = bounds[1][0] - bounds[0][0];
      const dy = bounds[1][1] - bounds[0][1];
      const x = (bounds[0][0] + bounds[1][0]) / 2;
      const y = (bounds[0][1] + bounds[1][1]) / 2;

      // Calculate scale and translate for zooming
      const scale = Math.min(8, 0.9 / Math.max(dx / this.width, dy / this.height));
      const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];


      // Apply zoom transformation
      const transform = d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale);

      this.svg.transition()
        .duration(1000)
        .call(this.zoom.transform, transform);

    } else {
      console.warn('State feature not found for:', stateName);
    }
  }

  private getStateCodeFromName(stateName: string): string | null {
    const stateMapping: { [key: string]: string } = {
      'Uttar Pradesh': 'UP',
      'Maharashtra': 'MH',
      'Karnataka': 'KA',
      'Tamil Nadu': 'TN',
      'West Bengal': 'WB',
      'Rajasthan': 'RJ',
      'Gujarat': 'GJ',
      'Telangana': 'TS',
      'Delhi': 'DL'
    };
    return stateMapping[stateName] || null;
  }

  private createSimplifiedIndiaMap(): void {

    // Simplified state boundaries (you would replace this with actual TopoJSON data)
    const states = [
      { name: 'Uttar Pradesh', code: 'UP', path: 'M200,150 L300,150 L300,200 L200,200 Z' },
      { name: 'Maharashtra', code: 'MH', path: 'M150,250 L250,250 L250,300 L150,300 Z' },
      { name: 'Karnataka', code: 'KA', path: 'M200,320 L280,320 L280,380 L200,380 Z' },
      { name: 'Tamil Nadu', code: 'TN', path: 'M220,390 L300,390 L300,450 L220,450 Z' },
      { name: 'West Bengal', code: 'WB', path: 'M350,200 L420,200 L420,280 L350,280 Z' },
      { name: 'Rajasthan', code: 'RJ', path: 'M100,100 L200,100 L200,180 L100,180 Z' },
      { name: 'Gujarat', code: 'GJ', path: 'M50,200 L150,200 L150,280 L50,280 Z' },
      { name: 'Telangana', code: 'TS', path: 'M250,280 L320,280 L320,340 L250,340 Z' },
      { name: 'Delhi', code: 'DL', path: 'M180,120 L200,120 L200,140 L180,140 Z' }
    ];

    // Create states group for proper layering
    const statesGroup = this.g.append('g').attr('class', 'states-group');
    
    // Add states to the states group
    const stateSelection = statesGroup.selectAll('.state')
      .data(states)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', (d: any) => {
        return d.path;
      })
      .attr('fill', '#ffd54f')
      .attr('stroke', '#ff8f00')
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
    const markerSelection = markersGroup.selectAll('.institute-marker')
      .data(this.institutes);

    const markerEnter = markerSelection.enter()
      .append('circle')
      .attr('class', 'institute-marker');

    markerEnter
      .attr('cx', (d: InstituteMarker) => {
        // Use projection if available (for GeoJSON), otherwise use simplified positioning
        if (this.projection) {
          const coords = this.projection([d.longitude, d.latitude]);
          const x = coords ? coords[0] : this.width / 2;
          return x;
        } else {
          // Fallback to center positioning when projection is not available
          const x = this.width / 2;
          return x;
        }
      })
      .attr('cy', (d: InstituteMarker) => {
        // Use projection if available (for GeoJSON), otherwise use simplified positioning
        if (this.projection) {
          const coords = this.projection([d.longitude, d.latitude]);
          const y = coords ? coords[1] : this.height / 2;
          return y;
        } else {
          // Fallback to center positioning when projection is not available
          const y = this.height / 2;
          return y;
        }
      })
      .attr('r', 2)
      .attr('fill', '#ff5722')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: InstituteMarker) => {
        this.onInstituteHover(event, d);
      })
      .on('mouseout', () => this.hideTooltip());

  }

  private createFallbackMap(): void {
    // Fallback: Simple rectangle representing India
    this.g.append('rect')
      .attr('x', 50)
      .attr('y', 50)
      .attr('width', this.width - 100)
      .attr('height', this.height - 100)
      .attr('fill', '#ffd54f')
      .attr('stroke', '#ff8f00')
      .attr('stroke-width', 1)
      .attr('rx', 10);

    this.g.append('text')
      .attr('x', this.width / 2)
      .attr('y', this.height / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('fill', '#333')
      .text('India Map');
  }

  private onStateHover(event: any, stateData: any): void {
    // Highlight state
    d3.select(event.target)
      .attr('fill', '#ffcc02')
      .attr('stroke-width', 1);

    this.showTooltip(event, stateData.name);
  }

  private onStateHoverOut(): void {
    // Reset state appearance
    this.g.selectAll('.state')
      .attr('fill', '#ffd54f')
      .attr('stroke-width', 1);

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

    const tooltipEnter = tooltip.enter()
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

    tooltip.merge(tooltipEnter as any)
      .html(text.replace(/\n/g, '<br>'))
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 10) + 'px')
      .transition()
      .duration(200)
      .style('opacity', 1);
  }

  private hideTooltip(): void {
    d3.select('body').selectAll('.map-tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0)
      .remove();
  }

  resetZoom(): void {
    this.svg.transition()
      .duration(750)
      .call(this.zoom.transform, d3.zoomIdentity);
  }
}
