import {
  Component,
  Inject,
  PLATFORM_ID,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { SidebarComponent } from './sidebar.component';
import * as d3 from 'd3';

interface DistrictFeature extends GeoJSON.Feature {
  properties: {
    id: string;
    name?: string;
  };
  geometry: GeoJSON.Geometry;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  private svg: any;
  collapsed = false;
  selectedDistrict = 'All';
  private bootstrap: any;
  selectedState: any;
  stateData = [
    {
      state: 'Andhra Pradesh',
      district: 'Patna',
      block: 'Block C',
      village: 'Village 3',
      collection_date: '2025-05-06',
      milk_qty: 1077,
      fat_per: 5.24,
      snf_per: 8.45,
      milk_type: 'Cow',
      source_centre: 'MCC',
      mcc_code: 'ANDPAT3769',
      lat: 23.721584,
      long: 84.46514,
      entry_method: 'Auto',
      sync_status: true,
    },
    {
      state: 'Andhra Pradesh',
      district: 'Patna',
      block: 'Block A',
      village: 'Village 2',
      collection_date: '2025-05-08',
      milk_qty: 1534,
      fat_per: 5.73,
      snf_per: 9.29,
      milk_type: 'Cow',
      source_centre: 'MCU',
      mcc_code: 'ANDPAT8662',
      lat: 26.146336,
      long: 76.17967,
      entry_method: 'API',
      sync_status: true,
    },
    {
      state: 'Andhra Pradesh',
      district: 'Patna',
      block: 'Block A',
      village: 'Village 2',
      collection_date: '2025-05-08',
      milk_qty: 1534,
      fat_per: 5.73,
      snf_per: 9.29,
      milk_type: 'Cow',
      source_centre: 'MCU',
      mcc_code: 'ANDPAT8662',
      lat: 26.146336,
      long: 76.17967,
      entry_method: 'Auto',
      sync_status: false,
    },
    {
      state: 'Andhra Pradesh',
      district: 'Bhopal',
      block: 'Block B',
      village: 'Village 4',
      collection_date: '2025-05-08',
      milk_qty: 2276,
      fat_per: 6.32,
      snf_per: 9.13,
      milk_type: 'Cow',
      source_centre: 'BMC',
      mcc_code: 'ANDBHO3833',
      lat: 24.11345,
      long: 87.354054,
      entry_method: 'API',
      sync_status: true,
    },
    {
      state: 'Bihar',
      district: 'Hyderabad',
      block: 'Block B',
      village: 'Village 4',
      collection_date: '2025-05-06',
      milk_qty: 1790,
      fat_per: 3.98,
      snf_per: 7.76,
      milk_type: 'Buffalo',
      source_centre: 'MCU',
      mcc_code: 'BIHHYD3386',
      lat: 23.588056,
      long: 70.69067,
      entry_method: 'Register',
      sync_status: false,
    },
    {
      state: 'Bihar',
      district: 'Chennai',
      block: 'Block B',
      village: 'Village 1',
      collection_date: '2025-05-05',
      milk_qty: 1364,
      fat_per: 3.76,
      snf_per: 9.43,
      milk_type: 'Cow',
      source_centre: 'BMC',
      mcc_code: 'BIHCHE3451',
      lat: 22.577724,
      long: 73.100274,
      entry_method: 'API',
      sync_status: true,
    },
    {
      state: 'Bihar',
      district: 'Delhi',
      block: 'Block D',
      village: 'Village 2',
      collection_date: '2025-05-04',
      milk_qty: 1734,
      fat_per: 3.76,
      snf_per: 9.43,
      milk_type: 'Cow',
      source_centre: 'BMC',
      mcc_code: 'BIHCHE3451',
      lat: 22.577724,
      long: 73.100274,
      entry_method: 'Auto',
      sync_status: false,
    },
    {
      state: 'Chhattisgarh',
      district: 'Hyderabad',
      block: 'Block B',
      village: 'Village 3',
      collection_date: '2025-05-09',
      milk_qty: 1382,
      fat_per: 4.8,
      snf_per: 8.09,
      milk_type: 'Buffalo',
      source_centre: 'MCC',
      mcc_code: 'CHHHYD2406',
      lat: 27.980244,
      long: 72.759497,
      entry_method: 'API',
      sync_status: false,
    },
    {
      state: 'Chhattisgarh',
      district: 'Patna',
      block: 'Block B',
      village: 'Village 2',
      collection_date: '2025-05-03',
      milk_qty: 2500,
      fat_per: 5.29,
      snf_per: 8.71,
      milk_type: 'Buffalo',
      source_centre: 'BMC',
      mcc_code: 'CHHPAT6286',
      lat: 24.965128,
      long: 72.869284,
      entry_method: 'Auto',
      sync_status: false,
    },
    {
      state: 'Chhattisgarh',
      district: 'Patna',
      block: 'Block B',
      village: 'Village 2',
      collection_date: '2025-05-03',
      milk_qty: 2500,
      fat_per: 5.29,
      snf_per: 8.71,
      milk_type: 'Buffalo',
      source_centre: 'BMC',
      mcc_code: 'CHHPAT6286',
      lat: 24.965128,
      long: 72.869284,
      entry_method: 'Register',
      sync_status: true,
    },
    {
      state: 'Chhattisgarh',
      district: 'Chennai',
      block: 'Block A',
      village: 'Village 1',
      collection_date: '2025-05-06',
      milk_qty: 3375,
      fat_per: 3.91,
      snf_per: 8.14,
      milk_type: 'Buffalo',
      source_centre: 'MCU',
      mcc_code: 'CHHCHE3451',
      lat: 23.525464,
      long: 84.120139,
      entry_method: 'API',
      sync_status: true,
    },
    {
      state: 'Goa',
      district: 'Chennai',
      block: 'Block B',
      village: 'Village 2',
      collection_date: '2025-05-07',
      milk_qty: 1793,
      fat_per: 4.37,
      snf_per: 9.19,
      milk_type: 'Mixed',
      source_centre: 'MCU',
      mcc_code: 'GOACHE5998',
      lat: 26.339829,
      long: 75.046551,
      entry_method: 'API',
      sync_status: true,
    },
    {
      state: 'Goa',
      district: 'Delhi',
      block: 'Block C',
      village: 'Village 1',
      collection_date: '2025-05-07',
      milk_qty: 1486,
      fat_per: 5.13,
      snf_per: 8.71,
      milk_type: 'Buffalo',
      source_centre: 'MCU',
      mcc_code: 'GOADEL8742',
      lat: 25.315423,
      long: 79.425495,
      entry_method: 'Register',
      sync_status: true,
    },
    {
      state: 'Goa',
      district: 'Bhopal',
      block: 'Block B',
      village: 'Village 3',
      collection_date: '2025-05-08',
      milk_qty: 3453,
      fat_per: 4.74,
      snf_per: 9.36,
      milk_type: 'Mixed',
      source_centre: 'MCU',
      mcc_code: 'GOABHO1755',
      lat: 24.62518,
      long: 75.718553,
      entry_method: 'Auto',
      sync_status: false,
    },
  ];

  @ViewChild('exampleModal') modalRef!: ElementRef;

  constructor(
    public auth: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Dynamically import Bootstrap only in browser
      this.bootstrap = await import('bootstrap');
      this.createMap('India', 'state');
    }
  }

  private createMap(fileName: string, mapType: string): void {
    const width = 1100;
    const height = 600;

    // Clear any existing elements
    d3.select('#map').selectAll('*').remove();

    // Create SVG container
    this.svg = d3
      .select('#map')
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    d3.json(`assets/geoJsonData/India.geojson`).then((data: any) => {
      this.drawMap(data.features as DistrictFeature[], width, height, mapType);
    });
  }

  private getRandomColor(): string {
    const colors = ['#6ec7ed', '#289fd2', '#157096', '#5694af'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  }

  private showModal() {
    if (isPlatformBrowser(this.platformId) && this.modalRef) {
      const modal = new this.bootstrap.Modal(this.modalRef.nativeElement);
      modal.show();
      for (const element of this.stateData) {
        if (element.state == this.selectedDistrict) {
          this.selectedState = element;
        }
      }
    }
  }
  private getElementSafely(id: string): HTMLElement | null {
    return isPlatformBrowser(this.platformId)
      ? document.getElementById(id)
      : null;
  }

  private drawMap(
    data: DistrictFeature[],
    width: number = 300,
    height: number = 700,
    mapType: string
  ): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .selectAll('*')
      .remove();

    const bounds = d3.geoBounds({ type: 'FeatureCollection', features: data });
    const centerLong = (bounds[0][0] + bounds[1][0]) / 2 + 2.5;
    const centerLat = (bounds[0][1] + bounds[1][1]) / 2 + 3;

    let projection, mapGroup;

    if (mapType === 'state') {
      projection = d3
        .geoMercator()
        .center([100, 20])
        .scale(800)
        .translate([width / 2 - 80, height / 2]);
      mapGroup = this.svg.append('g');
    } else {
      projection = d3
        .geoMercator()
        .center([centerLong, centerLat])
        .scale(5000)
        .translate([width / 2, height / 2]);
      mapGroup = this.svg.append('g');
    }

    const pathGenerator = d3.geoPath().projection(projection);

    const tooltip = d3
      .select('#map')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'rgba(255, 255, 255, 0.01)')
      .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('font-size', '14px');

    mapGroup
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .style('fill', () => this.getRandomColor())
      .style('stroke', '#fff')
      .style('stroke-width', '1')
      .style('cursor', 'pointer')
      .attr('data-original-color', () => this.getRandomColor())

      .on(
        'mouseover',
        (event: MouseEvent, d: { properties: { name: any } }) => {
          this.selectedDistrict = d.properties.name;

          d3.select(event.currentTarget as HTMLElement)
            .style('fill', '#ff7733')
            .style('stroke', '#000')
            .style('stroke-width', '2');

          tooltip
            .style('position', 'absolute')
            .style('background-color', 'red')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border', '1px solid black')
            .style('z-index', '9999')
            .style('opacity', '1')
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY}px`)
            .html(`<strong>${this.selectedDistrict}</strong>`);
        }
      )

      .on('mousemove', (event: MouseEvent) => {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 40}px`)
          .style('opacity', 1);
      })

      .on('mouseout', (event: { currentTarget: any }) => {
        d3.select(event.currentTarget)
          .style(
            'fill',
            d3.select(event.currentTarget).attr('data-original-color')
          )
          .style('stroke', '#fff')
          .style('stroke-width', '1');
        tooltip.transition().duration(200).style('opacity', 0);
      })

      .on('click', (event: MouseEvent, d: { properties: { name: any } }) => {
        this.selectedDistrict = d.properties.name;
        this.showModal();

        ['chartdistrictdiv', 'districtTable', 'districtDashboard'].forEach(
          (id) => {
            const el = this.getElementSafely(id);
            if (el) el.style.display = 'block';
          }
        );

        d3.selectAll('path')
          .style('fill', function () {
            return d3.select(this).attr('data-original-color');
          })
          .style('stroke', '#fff')
          .style('stroke-width', '1');

        d3.select(event.currentTarget as HTMLElement)
          .style('fill', '#ff7733')
          .style('stroke', '#000')
          .style('stroke-width', '2');
      });

    this.svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle')
      .attr('fill', '#333');
  }
}
