import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { DashboardDataService, AgeWiseDistributionResponse } from '../../services/dashboard-data.service';

export interface AgeGroupData {
  ageGroup: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StateData {
  stateId: string;
  stateName: string;
}

@Component({
  selector: 'app-age-group-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './age-group-chart.component.html',
  styleUrls: ['./age-group-chart.component.css']
})
export class AgeGroupChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedState: StateData | null = null;
  @Input() isLoading: boolean = false;

  chartOption: EChartsOption = {};
  chartLoading: boolean = false;
  chartInstance: any;
  private dataSubscription?: Subscription;
  private isLoadingData = false;
  private apiData: AgeGroupData[] = [];

  constructor(private dashboardService: DashboardDataService) {}

  // Mock data for age groups
  private allIndiaData: AgeGroupData[] = [
    { ageGroup: '18-25', count: 1250, percentage: 32, color: '#FF6B6B' },
    { ageGroup: '26-35', count: 1450, percentage: 37, color: '#4ECDC4' },
    { ageGroup: '36-45', count: 890, percentage: 23, color: '#45B7D1' },
    { ageGroup: '46-60', count: 310, percentage: 8, color: '#96CEB4' }
  ];

  private stateSpecificData: { [key: string]: AgeGroupData[] } = {
    'UP': [
      { ageGroup: '18-25', count: 180, percentage: 30, color: '#FF6B6B' },
      { ageGroup: '26-35', count: 210, percentage: 35, color: '#4ECDC4' },
      { ageGroup: '36-45', count: 150, percentage: 25, color: '#45B7D1' },
      { ageGroup: '46-60', count: 60, percentage: 10, color: '#96CEB4' }
    ],
    'MH': [
      { ageGroup: '18-25', count: 120, percentage: 28, color: '#FF6B6B' },
      { ageGroup: '26-35', count: 165, percentage: 38, color: '#4ECDC4' },
      { ageGroup: '36-45', count: 110, percentage: 26, color: '#45B7D1' },
      { ageGroup: '46-60', count: 35, percentage: 8, color: '#96CEB4' }
    ]
  };

  ngOnInit(): void {
    this.loadAgeGroupData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState']) {
      this.loadAgeGroupData();
    }
  }

  private updateChart(): void {
    if (this.isLoading) {
      this.chartLoading = true;
      return;
    }

    this.chartLoading = true;

    // Simulate API call delay
    setTimeout(() => {
      const data = this.getChartData();
      this.chartOption = this.createChartOption(data);
      this.chartLoading = false;
    }, 500);
  }

  private getChartData(): AgeGroupData[] {
    // Prioritize API data if available
    if (this.apiData.length > 0) {
      return this.apiData;
    }
    // Fallback to mock data
    if (this.selectedState && this.stateSpecificData[this.selectedState.stateId]) {
      return this.stateSpecificData[this.selectedState.stateId];
    }
    return this.allIndiaData;
  }

  private createChartOption(data: AgeGroupData[]): EChartsOption {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return {
      title: {
        text: this.selectedState ? `Age Distribution - ${this.selectedState.stateName}` : 'Age Distribution - All India',
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 600,
          color: '#2c3e50'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const data = params.data;
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${data.name}</div>
              <div style="display: flex; align-items: center; margin-bottom: 2px;">
                <div style="width: 12px; height: 12px; background: ${data.color}; border-radius: 2px; margin-right: 6px;"></div>
                <span>Count: <strong>${data.value.toLocaleString()}</strong></span>
              </div>
              <div style="color: #666; font-size: 12px;">Percentage: ${data.percentage}%</div>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: {
          color: '#333',
          fontSize: 12
        }
      },
      legend: {
        orient: 'horizontal',
        bottom: 10,
        left: 'center',
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 20,
        textStyle: {
          fontSize: 11,
          color: '#666'
        },
        formatter: (name: string) => {
          const item = data.find(d => d.ageGroup === name);
          return `${name} (${item?.percentage}%)`;
        }
      },
      series: [
        {
          name: 'Age Groups',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{d}%',
            fontSize: 10,
            color: '#666',
            fontWeight: 500
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 5,
            smooth: true
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            },
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            },
            scale: true,
            scaleSize: 5
          },
          data: data.map(item => ({
            name: item.ageGroup,
            value: item.count,
            percentage: item.percentage,
            color: item.color,
            itemStyle: {
              color: item.color
            }
          }))
        }
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: `Total\n${total.toLocaleString()}`,
            align: 'center',
            fill: '#2c3e50',
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 20
          }
        }
      ],
      animation: true,
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: (idx: number) => idx * 100
    };
  }

  onChartInit(chartInstance: any): void {
    this.chartInstance = chartInstance;
    
    // Ensure proper sizing after initialization
    setTimeout(() => {
      if (chartInstance && typeof chartInstance.resize === 'function') {
        chartInstance.resize({
          width: 'auto',
          height: 'auto'
        });
      }
    }, 100);
  }

  refreshChart(): void {
    this.loadAgeGroupData();
  }

  private loadAgeGroupData(): void {
    // Prevent concurrent API calls
    if (this.isLoadingData) {
      return;
    }

    this.isLoadingData = true;
    this.chartLoading = true;

    // Unsubscribe from previous subscription if exists
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.dataSubscription = this.dashboardService.getAgeWiseDistribution().subscribe({
      next: (response: AgeWiseDistributionResponse) => {
        if (response.success && response.data) {
          this.apiData = this.transformApiData(response.data);
        } else {
          console.warn('Invalid API response for age-wise distribution');
          this.apiData = [];
        }
        this.updateChart();
      },
      error: (error) => {
        console.error('Error fetching age-wise distribution data:', error);
        this.apiData = [];
        this.updateChart();
      },
      complete: () => {
        this.isLoadingData = false;
      }
    });
  }

  private transformApiData(data: any): AgeGroupData[] {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3'];
    const result: AgeGroupData[] = [];
    let colorIndex = 0;

    Object.entries(data).forEach(([ageGroup, percentage]) => {
      // Calculate approximate count based on percentage (assuming total of 10000 for demo)
      const count = Math.round((percentage as number) * 100);
      
      result.push({
        ageGroup,
        count,
        percentage: percentage as number,
        color: colors[colorIndex % colors.length]
      });
      colorIndex++;
    });

    return result;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}