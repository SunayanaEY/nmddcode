import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { Subscription } from 'rxjs';
import { DashboardDataService, TrainingInstituteTypeDistributionResponse } from '../../services/dashboard-data.service';
import { TranslateModule } from '@ngx-translate/core';

export interface InstituteTypeData {
  type: string;
  percentage: number;
  color: string;
}

export interface StateData {
  stateId: string;
  stateName: string;
}

@Component({
  selector: 'app-institute-type-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective,TranslateModule],
  templateUrl: './institute-type-chart.component.html',
  styleUrls: ['./institute-type-chart.component.css']
})
export class InstituteTypeChartComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedState: StateData | null = null;
  @Input() isLoading: boolean = false;
  @Input() stateId: number | null = null;
  @Input() districtId: number | null = null;

  chartOption: EChartsOption = {};
  chartLoading: boolean = false;
  chartInstance: any;
  private dataSubscription?: Subscription;
  private isLoadingData = false;
  private apiData: InstituteTypeData[] = [];

  constructor(private dashboardService: DashboardDataService) {}

  // Default data
  private defaultData: InstituteTypeData[] = [
    { type: 'Government', percentage: 0, color: '#4CAF50' },
    { type: 'Private', percentage: 0, color: '#FF9800' }
  ];

  ngOnInit(): void {
    this.loadInstituteTypeData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState'] || changes['isLoading'] || changes['stateId'] || changes['districtId']) {
      this.loadInstituteTypeData();
    }
  }

  private updateChart(): void {
    if (this.isLoading) {
      this.chartLoading = true;
      return;
    }

    this.chartLoading = true;

    setTimeout(() => {
      const data = this.getChartData();
      this.chartOption = this.createChartOption(data);
      this.chartLoading = false;
    }, 500);
  }

  getChartData(): InstituteTypeData[] {
    if (this.apiData.length > 0) {
      return this.apiData;
    }
    return this.defaultData;
  }

  private createChartOption(data: InstituteTypeData[]): EChartsOption {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c}% ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(item => item.type)
      },
      series: [
        {
          name: 'Institute Type',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data.map(item => ({
            value: item.percentage,
            name: item.type,
            itemStyle: {
              color: item.color
            }
          }))
        }
      ]
    };
  }

  onChartInit(chartInstance: any): void {
    this.chartInstance = chartInstance;
  }

  refreshChart(): void {
    this.loadInstituteTypeData();
  }

  private loadInstituteTypeData(): void {
    if (this.isLoadingData) {
      return;
    }

    this.isLoadingData = true;
    this.chartLoading = true;

    this.dataSubscription?.unsubscribe();
    this.dataSubscription = this.dashboardService.getTrainingInstituteTypeDistribution(
      this.stateId || undefined,
      this.districtId || undefined
    ).subscribe({
      next: (response: TrainingInstituteTypeDistributionResponse) => {
        if (response.success) {
          this.apiData = this.transformApiData(response.data);
        }
        this.isLoadingData = false;
        this.updateChart();
      },
      error: (error) => {
        console.error('Error loading institute type data:', error);
        this.apiData = [];
        this.isLoadingData = false;
        this.updateChart();
      }
    });
  }

  private transformApiData(data: { Government: number; Private: number }): InstituteTypeData[] {
    return [
      {
        type: 'Government',
        percentage: data.Government,
        color: '#4CAF50'
      },
      {
        type: 'Private',
        percentage: data.Private,
        color: '#FF9800'
      }
    ];
  }

  ngOnDestroy(): void {
    this.dataSubscription?.unsubscribe();
  }
}
