import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { FooterComponent } from './footer.component';
import { SidebarComponent } from './sidebar.component';
import * as d3 from 'd3';

interface DistrictFeature extends GeoJSON.Feature {
  properties: {
    id: string;
    name?: string | null;
  };
  geometry: GeoJSON.Geometry; // Use GeoJSON.Geometry for better compatibility
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
  constructor(public auth: AuthService) {}
  ngOnInit() {
    this.createMap('India', 'state');
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
  private drawMap(
    data: DistrictFeature[],
    width: number = 300,
    height: number = 700,
    mapType: string
  ): void {
    // Set the SVG size directly
    this.svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .selectAll('*')
      .remove();

    const bounds = d3.geoBounds({ type: 'FeatureCollection', features: data });

    const centerLong = (bounds[0][0] + bounds[1][0]) / 2 + 2.5; // large shift to the left
    const centerLat = (bounds[0][1] + bounds[1][1]) / 2 + 3;

    let projection, mapGroup;

    if (mapType === 'state') {
      projection = d3
        .geoMercator()
        .center([100, 20])
        .scale(800)
        .translate([width / 2 - 80, height / 2]);

      mapGroup = this.svg.append('g'); // no transform
    } else {
      projection = d3
        .geoMercator()
        .center([centerLong, centerLat])
        .scale(5000)
        .translate([width / 2, height / 2]);

      mapGroup = this.svg.append('g'); // no transform
    }

    const pathGenerator = d3.geoPath().projection(projection);

    const tooltip = d3
      .select('#map')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'rgba(255, 255, 255, 0.9)')
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

      .on('mouseover', (event: MouseEvent, d: DistrictFeature) => {
        d3.select(event.currentTarget as HTMLElement)
          .style('fill', '#ff7733')
          .style('stroke', '#000')
          .style('stroke-width', '2');

        tooltip
          .html(`<strong>${d.properties.name}</strong>`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 40}px`)
          .transition()
          .duration(200)
          .style('opacity', 0.9);
      })

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

      .on(
        'click',
        (event: MouseEvent, d: { properties: { Dist_Name: any } }) => {
          this.selectedDistrict = d.properties.Dist_Name;

          ['chartdistrictdiv', 'districtTable', 'districtDashboard'].forEach(
            (id) => {
              const el = document.getElementById(id);
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
        }
      );

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