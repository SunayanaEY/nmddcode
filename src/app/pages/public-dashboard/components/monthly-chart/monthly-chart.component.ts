import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { StateData } from '../../public-dashboard.component';

@Component({
  selector: 'app-monthly-chart',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './monthly-chart.component.html',
  styleUrls: ['./monthly-chart.component.css']
})
export class MonthlyChartComponent implements OnInit, OnChanges {
  @Input() selectedState: StateData | null = null;
  @Input() isLoading = false;

  chartOption: EChartsOption = {};
  chartLoading = false;

  // Mock data for monthly trainings
  private allIndiaData = {
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    series: [
      {
        name: 'Total Trainings',
        data: [120, 132, 101, 134, 90, 230, 210, 182, 191, 234],
        color: '#2196f3'
      },
      {
        name: 'Farmers Trained',
        data: [220, 182, 191, 234, 290, 330, 310, 282, 291, 334],
        color: '#4caf50'
      },
      {
        name: 'Certificates Issued',
        data: [150, 232, 201, 154, 190, 330, 410, 382, 391, 434],
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
          data: [45, 52, 38, 54, 35, 89, 78, 68, 72, 89],
          color: '#2196f3'
        },
        {
          name: 'Farmers Trained',
          data: [89, 72, 76, 89, 115, 132, 124, 112, 116, 134],
          color: '#4caf50'
        },
        {
          name: 'Certificates Issued',
          data: [56, 89, 76, 58, 72, 132, 164, 152, 156, 174],
          color: '#ff9800'
        }
      ]
    },
    'MH': {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      series: [
        {
          name: 'Total Trainings',
          data: [32, 38, 28, 42, 25, 67, 58, 52, 56, 67],
          color: '#2196f3'
        },
        {
          name: 'Farmers Trained',
          data: [67, 52, 56, 67, 85, 98, 92, 82, 86, 98],
          color: '#4caf50'
        },
        {
          name: 'Certificates Issued',
          data: [42, 67, 56, 44, 52, 98, 122, 112, 116, 128],
          color: '#ff9800'
        }
      ]
    }
  };

  ngOnInit(): void {
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedState'] || changes['isLoading']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    if (this.isLoading) {
      this.chartLoading = true;
      return;
    }

    this.chartLoading = false;
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

  private getChartData() {
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
    console.log('Monthly chart initialized');
    
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
    this.chartLoading = true;
    // Simulate API call
    setTimeout(() => {
      this.updateChart();
    }, 1000);
  }
}