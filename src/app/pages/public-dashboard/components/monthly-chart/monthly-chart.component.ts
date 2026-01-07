import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { StateData } from '../../public-dashboard.component';
import { DashboardDataService, MonthlyTrainingData } from '../../services/dashboard-data.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-monthly-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective,TranslateModule],
  templateUrl: './monthly-chart.component.html',
  styleUrls: ['./monthly-chart.component.css']
})
export class MonthlyChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedState: StateData | null = null;
  @Input() isLoading = false;
  @Input() stateId: number | null = null;
  @Input() districtId: number | null = null;
  @Input() trainingInstituteId: string | null = null;
  @Input() organizationId: number | null = null;
  @Input() instituteType: string | null = null;

  chartOption: EChartsOption = {};
  chartLoading = false;
  monthlyData: MonthlyTrainingData[] = [];
  private dataSubscription?: Subscription;
  private isLoadingData = false;

  constructor(private dashboardService: DashboardDataService) {}

  // Mock data for monthly trainings
  private allIndiaData = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    series: [
      {
        name: 'Total Trainings',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: '#2196f3'
      },
      {
        name: 'Trainees Trained',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: '#4caf50'
      },
      {
        name: 'Certificates Issued',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: '#ff9800'
      }
    ]
  };

  private stateSpecificData: { [key: string]: any } = {
    'UP': {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      series: [
        {
          name: 'Total Trainings',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          color: '#2196f3'
        },
        {
          name: 'Trainees Trained',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          color: '#4caf50'
        },
        {
          name: 'Certificates Issued',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          color: '#ff9800'
        }
      ]
    },
    'MH': {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      series: [
        {
          name: 'Total Trainings',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          color: '#2196f3'
        },
        {
          name: 'Trainees Trained',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          color: '#4caf50'
        },
        {
          name: 'Certificates Issued',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          color: '#ff9800'
        }
      ]
    }
  };

  ngOnInit(): void {
    // Initialize chart with fallback data first
    this.updateChart();
    // Then load actual data
    this.loadMonthlyData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState'] || changes['isLoading'] || changes['stateId'] || changes['districtId'] || changes['trainingInstituteId'] || changes['organizationId'] || changes['instituteType']) {
      this.loadMonthlyData();
    }
  }

  private updateChart(): void {
    // Don't prevent chart rendering when parent is loading
    // Only show chart loading when this component is loading its own data
    this.chartLoading = this.isLoadingData;
    const data = this.getChartData();

    this.chartOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: 'transparent',
        textStyle: {
          color: '#fff',
          fontSize: 12
        },
        formatter: (params: any) => {
          let result = `<div style="font-weight: 600; margin-bottom: 4px;">${params[0].axisValue}</div>`;
          params.forEach((param: any) => {
            result += `<div style="display: flex; align-items: center; margin-bottom: 2px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${param.color}; border-radius: 50%; margin-right: 8px;"></span>
              <span style="flex: 1;">${param.seriesName}:</span>
              <span style="font-weight: 600; margin-left: 8px;">${param.value}</span>
            </div>`;
          });
          return result;
        }
      },
      legend: {
        data: data.series.map((s: any) => s.name),
        top: 0,
        textStyle: {
          color: '#666',
          fontSize: 12
        },
        itemGap: 20
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.months,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisLabel: {
          color: '#666',
          fontSize: 11
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: '#666',
          fontSize: 11
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      },
      series: data.series.map((seriesData: { name: string; data: number[]; color?: string }) => {
        const defaultColor = '#2196f3'; // Default blue color
        const color = seriesData.color ?? defaultColor;

        return {
          name: seriesData.name,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: color
          },
          itemStyle: {
            color: color,
            borderColor: '#fff',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: this.hexToRgba(color, 0.3)
                },
                {
                  offset: 1,
                  color: this.hexToRgba(color, 0.05)
                }
              ]
            }
          },
          data: seriesData.data,
          emphasis: {
            focus: 'series',
            itemStyle: {
              shadowBlur: 10,
              shadowColor: color
            }
          }
        };
      })
    };
  }

  private loadMonthlyData(): void {
    // Prevent multiple concurrent API calls
    if (this.isLoadingData) {
      return;
    }

    this.isLoadingData = true;
    // Update chart loading state
    this.updateChart();

    // Cancel any existing subscription
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.dataSubscription = this.dashboardService.getMonthlyTrainingCount(
      this.stateId || undefined,
      this.districtId || undefined,
      this.trainingInstituteId || undefined,
      this.organizationId || undefined,
      this.instituteType || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.monthlyData = response.data;
        }
        this.isLoadingData = false;
        this.updateChart();
      },
      error: (error) => {
        console.error('Error fetching monthly training data:', error);
        this.isLoadingData = false;
        // Use mock data as fallback
        this.updateChart();
      }
    });
  }

  private getChartData() {
    if (this.monthlyData && this.monthlyData.length > 0) {
      // Use API data
      return {
        months: this.monthlyData.map(item => item.month),
        series: [
          {
            name: 'Total Trainings',
            data: this.monthlyData.map(item => item.totalTrainings),
            color: '#2196f3'
          },
          {
            name: 'Trainees Trained',
            data: this.monthlyData.map(item => item.farmersTrained),
            color: '#4caf50'
          },
          {
            name: 'Certificates Issued',
            data: this.monthlyData.map(item => item.certificatesIssued),
            color: '#ff9800'
          }
        ]
      };
    }

    // Fallback to mock data
    if (this.selectedState && this.stateSpecificData[this.selectedState.stateId]) {
      return this.stateSpecificData[this.selectedState.stateId];
    }
    return this.allIndiaData;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  onChartInit(ec: any): void {
    // Chart initialization callback

    // Ensure proper sizing after initialization
    setTimeout(() => {
      if (ec && typeof ec.resize === 'function') {
        ec.resize({
          width: 'auto',
          height: 'auto'
        });
      }
    }, 100);
  }

  refreshChart(): void {
    this.loadMonthlyData();
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}
