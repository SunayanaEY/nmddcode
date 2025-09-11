import { Component, ElementRef, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { StateData } from '../../public-dashboard.component';
import { DashboardDataService, InstituteLocationData } from '../../services/dashboard-data.service';

interface InstituteMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}

@Component({
  selector: 'app-india-map',
  standalone: true,
  imports: [CommonModule],
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
    console.log('=== IndiaMapComponent ngOnInit START ===');
    console.log('Component inputs:', {
      selectedState: this.selectedState,
      isLoading: this.isLoading
    });
    this.loadInstituteData();
    console.log('=== IndiaMapComponent ngOnInit END ===');
  }

  private loadInstituteData(): void {
    this.dashboardService.getInstituteLocations().subscribe({
      next: (data: InstituteLocationData[]) => {
        this.institutes = data.map(institute => ({
          id: institute.id,
          name: institute.name,
          latitude: institute.latitude,
          longitude: institute.longitude,
          address: institute.address
        }));
        console.log('✅ Loaded institute data:', this.institutes.length, 'institutes');
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
    console.log('=== ngAfterViewInit START ===');
    console.log('MapContainer exists:', !!this.mapContainer);
    console.log('MapContainer nativeElement exists:', !!(this.mapContainer && this.mapContainer.nativeElement));
    console.log('isLoading state:', this.isLoading);

    // Check if we can initialize immediately or need to wait for loading to complete
    if (!this.isLoading) {
      this.initializeMapWhenReady();
    } else {
      // Watch for isLoading to become false
      this.waitForLoadingComplete();
    }

    console.log('=== ngAfterViewInit END ===');
  }

  private waitForLoadingComplete(): void {
    console.log('=== Waiting for loading to complete ===');
    const checkLoading = () => {
      if (!this.isLoading) {
        console.log('✅ Loading completed, initializing map');
        this.initializeMapWhenReady();
      } else {
        console.log('⏳ Still loading, checking again in 100ms');
        setTimeout(checkLoading, 100);
      }
    };
    setTimeout(checkLoading, 100);
  }

  private initializeMapWhenReady(): void {
    console.log('=== initializeMapWhenReady START ===');
    // Add a small delay to ensure the DOM is fully rendered
    setTimeout(() => {
      console.log('=== setTimeout callback executing ===');
      if (this.mapContainer && this.mapContainer.nativeElement) {
        console.log('MapContainer is ready, proceeding with initialization');
        this.initializeMap();
      } else {
        console.log('MapContainer not ready after timeout!');
        console.log('MapContainer:', this.mapContainer);
        console.log('NativeElement:', this.mapContainer?.nativeElement);
      }
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.svg) {
      this.svg.remove();
    }
  }

  private initializeMap(): void {
    console.log('=== initializeMap START ===');

    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      console.error('❌ Map container not found during initialization');
      console.log('MapContainer:', this.mapContainer);
      console.log('NativeElement:', this.mapContainer?.nativeElement);
      return;
    }

    const container = this.mapContainer.nativeElement;
    console.log('✅ Container element found:', container);

    const rect = container.getBoundingClientRect();
    console.log('Container getBoundingClientRect():', rect);

    this.width = rect.width || 500;
    this.height = rect.height || 400;

    console.log('✅ Map dimensions calculated:', { width: this.width, height: this.height });

    // Create SVG
    console.log('Creating SVG element...');
    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      //.style('background', '#f8f9fa');
      .style('background','rgba(255, 255, 255, 0.08)')
      .style('backdrop-filter','blur(25px)');
    console.log('✅ SVG created:', this.svg.node());

    // Create main group
    console.log('Creating main group...');
    this.g = this.svg.append('g');
    console.log('✅ Main group created:', this.g.node());

    // Setup projection
    console.log('Setting up projection...');
    this.projection = d3.geoMercator()
      .center([70.9629, 15.5937]) // Center of India
      .scale(700)
      .translate([this.width / 2, this.height / 2]);

    this.path = d3.geoPath().projection(this.projection);
    console.log('✅ Projection and path configured');

    // Setup zoom
    console.log('Setting up zoom behavior...');
    this.zoom = d3.zoom()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        console.log('Zoom event:', event.transform);
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);
    console.log('✅ Zoom behavior applied');
    console.log('=== initializeMap COMPLETED SUCCESSFULLY ===');

    // Load the India map data
    this.loadIndiaMap();
  }

  private async loadIndiaMap(): Promise<void> {
    console.log('=== loadIndiaMap START ===');

    try {
      console.log('🌐 Attempting to fetch GeoJSON data from: assets/geoJsonData/India.geojson');

      const response = await fetch('assets/geoJsonData/India.geojson');
      console.log('📡 Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      console.log('📄 Parsing JSON response...');
      const geoData = await response.json();
      console.log('✅ GeoJSON data loaded successfully!');
      console.log('GeoJSON structure:', {
        type: geoData.type,
        featuresCount: geoData.features?.length || 0,
        firstFeature: geoData.features?.[0] ? {
          type: geoData.features[0].type,
          properties: Object.keys(geoData.features[0].properties || {}),
          geometryType: geoData.features[0].geometry?.type
        } : 'No features'
      });

      console.log('🗺️ Creating map from GeoJSON...');
      this.createMapFromGeoJSON(geoData);
      console.log('📍 Adding institute markers...');
      this.addInstituteMarkers();
      console.log('=== loadIndiaMap COMPLETED SUCCESSFULLY ===');

    } catch (error) {
      console.error('❌ Error loading India map:', error);
      const errorObj = error as Error;
      console.log('Error details:', {
        name: errorObj.name || 'Unknown',
        message: errorObj.message || 'Unknown error',
        stack: errorObj.stack || 'No stack trace'
      });
      console.log('🔄 Falling back to simplified map...');
      this.createSimplifiedIndiaMap();
      this.addInstituteMarkers();
      console.log('=== loadIndiaMap COMPLETED WITH FALLBACK ===');
    }
  }

  private createMapFromGeoJSON(geoData: any): void {
    console.log('=== createMapFromGeoJSON START ===');
    console.log('Input geoData:', {
      type: geoData.type,
      featuresCount: geoData.features?.length
    });

    // Set up projection for India
    console.log('🌍 Setting up projection...');
    this.projection = d3.geoMercator()
      .center([82.9629, 20.5937]) // Center of India
      .scale(1000)
      .translate([this.width / 2, this.height / 2]);
    console.log('✅ Projection configured:', {
      center: [78.9629, 20.5937],
      scale: 1000,
      translate: [this.width / 2, this.height / 2]
    });

    this.path = d3.geoPath().projection(this.projection);
    console.log('✅ Path generator created');

    // Draw states/features from GeoJSON
    console.log('🎨 Drawing states from GeoJSON features...');
    const stateSelection = this.g.selectAll('.state')
      .data(geoData.features);
    console.log('Data bound to selection, features count:', geoData.features.length);

    const stateEnter = stateSelection.enter()
      .append('path')
      .attr('class', 'state');
    console.log('✅ Path elements created for', geoData.features.length, 'features');

    stateEnter
      .attr('d', (d: any) => {
        const pathData = this.path(d);
        console.log('Path data for feature:', d.properties?.NAME || d.properties?.name, pathData ? 'Generated' : 'NULL');
        return pathData;
      })
      .attr('fill', '#ffd54f')
      .attr('stroke', '#ff8f00')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        d3.select(event.currentTarget).attr('fill', '#ffcc02');
        const stateName = d.properties.NAME || d.properties.name || 'Unknown State';
        console.log('State hovered:', stateName);
        this.showTooltip(event, stateName);
      })
      .on('mouseout', (event: any) => {
        d3.select(event.currentTarget).attr('fill', '#ffd54f');
        this.hideTooltip();
      })
      .on('click', (event: any, d: any) => {
        const stateName = d.properties.NAME || d.properties.name;
        console.log('State clicked:', stateName);
        // Find matching state data
        const stateCode = this.getStateCodeFromName(stateName);
        if (stateCode && this.statesData[stateCode]) {
          this.stateSelected.emit(this.statesData[stateCode]);
        }
      });

    console.log('✅ State paths rendered with interactions');
    console.log('=== createMapFromGeoJSON COMPLETED ===');
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
    console.log('=== createSimplifiedIndiaMap START ===');
    console.log('🔄 Using fallback simplified map');

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
    console.log('📋 Simplified states data prepared:', states.length, 'states');

    // Add states
    console.log('🎨 Rendering simplified state paths...');
    const stateSelection = this.g.selectAll('.state')
      .data(states)
      .enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', (d: any) => {
        console.log('Rendering state:', d.name, 'with path:', d.path);
        return d.path;
      })
      .attr('fill', '#ffd54f')
      .attr('stroke', '#ff8f00')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: any) => {
        console.log('Simplified state hovered:', d.name);
        this.onStateHover(event, d);
      })
      .on('mouseout', () => this.onStateHoverOut())
      .on('click', (event: any, d: any) => {
        console.log('Simplified state clicked:', d.name);
        this.onStateClick(d);
      });

    console.log('✅ Simplified map rendered successfully');
    console.log('=== createSimplifiedIndiaMap COMPLETED ===');
  }

  private addInstituteMarkers(): void {
    console.log('=== addInstituteMarkers START ===');
    console.log('📍 Institute data:', this.institutes.length, 'institutes');
    console.log('🗺️ Projection available:', !!this.projection);

    // Add institute markers
    const markerSelection = this.g.selectAll('.institute-marker')
      .data(this.institutes);
    console.log('Data bound to marker selection');

    const markerEnter = markerSelection.enter()
      .append('circle')
      .attr('class', 'institute-marker');
    console.log('✅ Circle elements created for', this.institutes.length, 'institutes');

    markerEnter
      .attr('cx', (d: InstituteMarker) => {
        // Use projection if available (for GeoJSON), otherwise use simplified positioning
        if (this.projection) {
          const coords = this.projection([d.longitude, d.latitude]);
          const x = coords ? coords[0] : this.width / 2;
          console.log(`📍 ${d.name} projected to x:${x} (lat:${d.latitude}, lng:${d.longitude})`);
          return x;
        } else {
          // Fallback to center positioning when projection is not available
          const x = this.width / 2;
          console.log(`📍 ${d.name} positioned at fallback x:${x}`);
          return x;
        }
      })
      .attr('cy', (d: InstituteMarker) => {
        // Use projection if available (for GeoJSON), otherwise use simplified positioning
        if (this.projection) {
          const coords = this.projection([d.longitude, d.latitude]);
          const y = coords ? coords[1] : this.height / 2;
          console.log(`📍 ${d.name} projected to y:${y}`);
          return y;
        } else {
          // Fallback to center positioning when projection is not available
          const y = this.height / 2;
          console.log(`📍 ${d.name} positioned at fallback y:${y}`);
          return y;
        }
      })
      .attr('r', 6)
      .attr('fill', '#ff5722')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event: any, d: InstituteMarker) => {
        console.log('Institute marker hovered:', d.name);
        this.onInstituteHover(event, d);
      })
      .on('mouseout', () => this.hideTooltip());

    console.log('✅ Institute markers rendered successfully');
    console.log('=== addInstituteMarkers COMPLETED ===');
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
      .attr('stroke-width', 2)
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
      .attr('stroke-width', 3);

    this.showTooltip(event, stateData.name);
  }

  private onStateHoverOut(): void {
    // Reset state appearance
    this.g.selectAll('.state')
      .attr('fill', '#ffd54f')
      .attr('stroke-width', 2);

    this.hideTooltip();
  }

  private onStateClick(stateData: any): void {
    const state = this.statesData[stateData.code];
    if (state) {
      this.stateSelected.emit(state);
    }
  }

  private onInstituteHover(event: any, institute: InstituteMarker): void {
    this.showTooltip(event, `${institute.name}\n${institute.address}`);
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
      .html(text.replace('\n', '<br>'))
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
