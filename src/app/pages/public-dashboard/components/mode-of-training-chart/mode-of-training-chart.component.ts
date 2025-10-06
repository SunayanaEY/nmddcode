import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { DashboardDataService, ModeOfTrainingDistributionResponse } from '../../services/dashboard-data.service';
import { TranslateModule } from '@ngx-translate/core';

export interface InstituteRegistrationData {
  type: string;
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
  imports: [CommonModule, NgxEchartsDirective,TranslateModule],
  templateUrl: './mode-of-training-chart.component.html',
  styleUrls: ['./mode-of-training-chart.component.css']
})
export class ModeOfTrainingChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedState: StateData | null = null;
  @Input() isLoading: boolean = false;
  @Input() stateId: number | null = null;
  @Input() districtId: number | null = null;

  chartOption: EChartsOption = {};
  chartLoading: boolean = false;
  chartInstance: any;
  private dataSubscription?: Subscription;
  private isLoadingData = false;
  private apiData: InstituteRegistrationData[] = [];

  constructor(private dashboardService: DashboardDataService) {}

  // Mock data for institute registration types
  private allIndiaData: InstituteRegistrationData[] = [
    { type: 'Government Registered', count: 1250, percentage: 65, color: '#059669', icon: 'university' },
    { type: 'Private Institutes', count: 675, percentage: 35, color: '#DC2626', icon: 'building' }
  ];

  private stateSpecificData: { [key: string]: InstituteRegistrationData[] } = {
    'UP': [
      { type: 'Government Registered', count: 320, percentage: 70, color: '#059669', icon: 'university' },
      { type: 'Private Institutes', count: 137, percentage: 30, color: '#DC2626', icon: 'building' }
    ],
    'MH': [
      { type: 'Government Registered', count: 180, percentage: 60, color: '#059669', icon: 'university' },
      { type: 'Private Institutes', count: 120, percentage: 40, color: '#DC2626', icon: 'building' }
    ]
  };

  ngOnInit(): void {
    this.loadModeOfTrainingData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState'] || changes['isLoading'] || changes['stateId'] || changes['districtId']) {
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

  private getChartData(): InstituteRegistrationData[] {
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

    this.dataSubscription = this.dashboardService.getModeOfTrainingDistribution(this.stateId || undefined, this.districtId || undefined).subscribe({
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

  private transformApiData(data: any): InstituteRegistrationData[] {
    const colorMap: { [key: string]: string } = {
      'Government': '#059669',
      'Private': '#DC2626'
    };

    const iconMap: { [key: string]: string } = {
      'Government': 'university',
      'Private': 'building'
    };

    return Object.entries(data).map(([type, percentage]) => ({
      type: type === 'Government' ? 'Government Registered' : 'Private Institutes',
      count: Math.round((percentage as number) * 10), // Approximate count based on percentage
      percentage: percentage as number,
      color: colorMap[type] || '#6B7280',
      icon: iconMap[type] || 'building'
    }));
  }

  private createChartOption(data: InstituteRegistrationData[]): EChartsOption {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    return {
      title: {
        text: this.selectedState ? `Institute Registration - ${this.selectedState.stateName}` : 'Institute Registration - All India',
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
          const item = data.find(d => d.type === name);
          return `${name} (${item?.percentage}%)`;
        }
      },
      series: [
        {
          name: 'Institute Registration Types',
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
            name: item.type,
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

  getMostPopularType(): string {
    const data = this.getChartData();
    const maxItem = data.reduce((prev, current) =>
      (prev.count > current.count) ? prev : current
    );
    return maxItem.type;
  }

  getTotalTypes(): number {
    return this.getChartData().length;
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
