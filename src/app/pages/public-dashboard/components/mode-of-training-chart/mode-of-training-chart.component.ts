import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { DashboardDataService, ModeOfTrainingDistributionResponse } from '../../services/dashboard-data.service';

export interface ModeOfTrainingData {
  mode: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface StateData {
  stateId: string;
  stateName: string;
}

@Component({
  selector: 'app-mode-of-training-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './mode-of-training-chart.component.html',
  styleUrls: ['./mode-of-training-chart.component.css']
})
export class ModeOfTrainingChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedState: StateData | null = null;
  @Input() isLoading: boolean = false;

  chartOption: EChartsOption = {};
  chartLoading: boolean = false;
  chartInstance: any;
  private dataSubscription?: Subscription;
  private isLoadingData = false;
  private apiData: ModeOfTrainingData[] = [];

  constructor(private dashboardService: DashboardDataService) {}

  // Mock data for training modes
  private allIndiaData: ModeOfTrainingData[] = [
    { mode: 'Online', count: 1580, percentage: 40, color: '#4F46E5', icon: 'laptop' },
    { mode: 'Offline', count: 1422, percentage: 36, color: '#059669', icon: 'users' },
    { mode: 'Hybrid', count: 632, percentage: 16, color: '#DC2626', icon: 'globe' },
    { mode: 'Field Training', count: 316, percentage: 8, color: '#D97706', icon: 'map-marker-alt' }
  ];

  private stateSpecificData: { [key: string]: ModeOfTrainingData[] } = {
    'UP': [
      { mode: 'Online', count: 240, percentage: 38, color: '#4F46E5', icon: 'laptop' },
      { mode: 'Offline', count: 228, percentage: 36, color: '#059669', icon: 'users' },
      { mode: 'Hybrid', count: 114, percentage: 18, color: '#DC2626', icon: 'globe' },
      { mode: 'Field Training', count: 48, percentage: 8, color: '#D97706', icon: 'map-marker-alt' }
    ],
    'MH': [
      { mode: 'Online', count: 172, percentage: 42, color: '#4F46E5', icon: 'laptop' },
      { mode: 'Offline', count: 143, percentage: 35, color: '#059669', icon: 'users' },
      { mode: 'Hybrid', count: 61, percentage: 15, color: '#DC2626', icon: 'globe' },
      { mode: 'Field Training', count: 33, percentage: 8, color: '#D97706', icon: 'map-marker-alt' }
    ]
  };

  ngOnInit(): void {
    this.loadModeOfTrainingData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState']) {
      this.loadModeOfTrainingData();
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

  private getChartData(): ModeOfTrainingData[] {
    // Use API data if available
    if (this.apiData && this.apiData.length > 0) {
      return this.apiData;
    }
    
    // Fallback to mock data
    if (this.selectedState && this.stateSpecificData[this.selectedState.stateId]) {
      return this.stateSpecificData[this.selectedState.stateId];
    }
    return this.allIndiaData;
  }

  private loadModeOfTrainingData(): void {
    // Prevent multiple concurrent API calls
    if (this.isLoadingData) {
      return;
    }

    this.isLoadingData = true;
    this.chartLoading = true;
    
    // Cancel any existing subscription
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    
    this.dataSubscription = this.dashboardService.getModeOfTrainingDistribution().subscribe({
      next: (response: ModeOfTrainingDistributionResponse) => {
        if (response.success) {
          // Transform API data to component format
          this.apiData = this.transformApiData(response.data);
        }
        this.updateChart();
        this.chartLoading = false;
        this.isLoadingData = false;
      },
      error: (error) => {
        console.error('Error fetching mode of training data:', error);
        this.chartLoading = false;
        this.isLoadingData = false;
        // Use mock data as fallback
        this.updateChart();
      }
    });
  }

  private transformApiData(data: any): ModeOfTrainingData[] {
    const colorMap: { [key: string]: string } = {
      'Online': '#4F46E5',
      'Offline': '#059669', 
      'Hybrid': '#DC2626',
      'Field': '#D97706'
    };
    
    const iconMap: { [key: string]: string } = {
      'Online': 'laptop',
      'Offline': 'users',
      'Hybrid': 'globe', 
      'Field': 'map-marker-alt'
    };

    return Object.entries(data).map(([mode, percentage]) => ({
      mode: mode === 'Field' ? 'Field Training' : mode,
      count: Math.round((percentage as number) * 10), // Approximate count based on percentage
      percentage: percentage as number,
      color: colorMap[mode] || '#6B7280',
      icon: iconMap[mode] || 'chart-bar'
    }));
  }

  private createChartOption(data: ModeOfTrainingData[]): EChartsOption {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return {
      title: {
        text: this.selectedState ? `Training Modes - ${this.selectedState.stateName}` : 'Training Modes - All India',
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
              <div style="font-weight: 600; margin-bottom: 4px; display: flex; align-items: center;">
                <i class="fas fa-${data.icon}" style="margin-right: 6px; color: ${data.color};"></i>
                ${data.name}
              </div>
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
          const item = data.find(d => d.mode === name);
          return `${name} (${item?.percentage}%)`;
        }
      },
      series: [
        {
          name: 'Training Modes',
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              const data = params.data;
              return `{icon|} {name|${params.name}}\n{percent|${params.percent}%}`;
            },
            rich: {
              icon: {
                fontSize: 12,
                color: '#666'
              },
              name: {
                fontSize: 10,
                color: '#333',
                fontWeight: 500
              },
              percent: {
                fontSize: 10,
                color: '#666',
                fontWeight: 'bold' as any
              }
            }
          },
          labelLine: {
            show: true,
            length: 12,
            length2: 8,
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
              fontWeight: 'bold' as any,
              fontSize: 12
            },
            scale: true,
            scaleSize: 5
          },
          data: data.map(item => ({
            name: item.mode,
            value: item.count,
            percentage: item.percentage,
            color: item.color,
            icon: item.icon,
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
    // Ensure proper resize after initialization
    setTimeout(() => {
      if (this.chartInstance) {
        this.chartInstance.resize({ width: 'auto', height: 'auto' });
      }
    }, 100);
  }

  refreshChart(): void {
    this.loadModeOfTrainingData();
  }

  getMostPopularMode(): string {
    const data = this.getChartData();
    const maxItem = data.reduce((prev, current) => 
      (prev.count > current.count) ? prev : current
    );
    return maxItem.mode;
  }

  getTotalModes(): number {
    return this.getChartData().length;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}