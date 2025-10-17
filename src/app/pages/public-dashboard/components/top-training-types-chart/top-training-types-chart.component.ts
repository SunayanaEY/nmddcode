import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { StateData } from '../../public-dashboard.component';
import { DashboardDataService, TopTrainingTypeData } from '../../services/dashboard-data.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-top-training-types-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective, TranslateModule],
  templateUrl: './top-training-types-chart.component.html',
  styleUrls: ['./top-training-types-chart.component.css']
})
export class TopTrainingTypesChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedState: StateData | null = null;
  @Input() isLoading = false;
  @Input() stateId: number | null = null;
  @Input() districtId: number | null = null;
  @Input() trainingInstituteId: string | null = null;

  chartOption: EChartsOption = {};
  chartLoading = false;
  topTrainingTypesData: TopTrainingTypeData[] = [];
  private dataSubscription?: Subscription;
  private isLoadingData = false;

  constructor(private dashboardService: DashboardDataService) {}

  ngOnInit(): void {
    // Initialize chart with empty data first
    this.updateChart();
    // Then load actual data
    this.loadTopTrainingTypesData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState'] || changes['stateId'] || changes['districtId'] || changes['trainingInstituteId']) {
      this.loadTopTrainingTypesData();
    }
  }

  private updateChart(): void {
    if (this.isLoadingData) {
      this.chartLoading = true;
      return;
    }

    this.chartLoading = false;

    // Sort data by totalTrainings in descending order and take top 5
    const sortedData = [...this.topTrainingTypesData]
      .sort((a, b) => b.totalTrainings - a.totalTrainings)
      .slice(0, 5);

    const trainingTypeNames = sortedData.map(item => item.trainingTypeName);
    const trainingCounts = sortedData.map(item => item.totalTrainings);

    // Generate colors for bars
    const colors = ['#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

    this.chartOption = {
      title: {
        text: 'Top 5 Training Types',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#2c3e50'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params: any) => {
          const data = params[0];
          return `
            <div style="padding: 8px;">
              <strong>${data.name}</strong><br/>
              <span style="color: ${data.color};">●</span> 
              Total Trainings: <strong>${data.value}</strong>
            </div>
          `;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      grid: {
        left: '12%',
        right: '4%',
        bottom: '25%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: trainingTypeNames,
        axisLabel: {
          interval: 0,
          rotate: 45,
          fontSize: 10,
          color: '#666',
          formatter: (value: string) => {
            // Truncate long names
            return value.length > 20 ? value.substring(0, 20) + '...' : value;
          }
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisTick: {
          alignWithLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: 'Number of Trainings',
        nameLocation: 'middle',
        nameGap: 50,
        nameRotate: 90,
        nameTextStyle: {
          color: '#666',
          fontSize: 12,
          fontWeight: 'bold'
        },
        axisLabel: {
          color: '#666',
          fontSize: 10
        },
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Training Count',
          type: 'bar',
          data: trainingCounts.map((value, index) => ({
            value: value,
            itemStyle: {
              color: colors[index % colors.length],
              borderRadius: [4, 4, 0, 0]
            }
          })),
          barWidth: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
            color: '#333',
            fontWeight: 'bold'
          }
        }
      ],
      animation: true,
      animationType: 'scale',
      animationEasing: 'elasticOut',
      animationDelay: (idx: number) => idx * 100
    };
  }

  private loadTopTrainingTypesData(): void {
    if (this.isLoadingData) {
      return;
    }

    this.isLoadingData = true;
    this.chartLoading = true;

    // Unsubscribe from previous subscription
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    this.dataSubscription = this.dashboardService.getTopTrainingTypes(this.stateId, this.districtId, this.trainingInstituteId).subscribe({
      next: (response) => {
        this.isLoadingData = false;
        if (response.success && response.data) {
          this.topTrainingTypesData = response.data;
        } else {
          this.topTrainingTypesData = [];
        }
        this.updateChart();
      },
      error: (error) => {
        console.error('Error loading top training types data:', error);
        this.isLoadingData = false;
        this.topTrainingTypesData = [];
        this.updateChart();
      }
    });
  }

  onChartInit(ec: any): void {
    // Chart initialization logic if needed
  }

  refreshChart(): void {
    this.loadTopTrainingTypesData();
  }

  getTotalTrainings(): number {
    return this.topTrainingTypesData.reduce((sum, item) => sum + item.totalTrainings, 0);
  }

  getTopTrainingTypeName(): string {
    if (this.topTrainingTypesData.length === 0) {
      return 'N/A';
    }
    const sortedData = [...this.topTrainingTypesData].sort((a, b) => b.totalTrainings - a.totalTrainings);
    return sortedData[0]?.trainingTypeName || 'N/A';
  }

  ngOnDestroy(): void {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
}