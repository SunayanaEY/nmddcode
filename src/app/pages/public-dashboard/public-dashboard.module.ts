import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// NgxEcharts Module
import { NgxEchartsModule } from 'ngx-echarts';

// Components
import { PublicDashboardComponent } from './public-dashboard.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { IndiaMapComponent } from './components/india-map/india-map.component';
import { MonthlyChartComponent } from './components/monthly-chart/monthly-chart.component';
import { AgeGroupChartComponent } from './components/age-group-chart/age-group-chart.component';
import { ModeOfTrainingChartComponent } from './components/mode-of-training-chart/mode-of-training-chart.component';
// Services
import { DashboardDataService } from './services/dashboard-data.service';

// Routes
const routes: Routes = [
  {
    path: '',
    component: PublicDashboardComponent,
    data: {
      title: 'Public Dashboard - National Dairy Development Programme',
      description:
        'View training statistics, farmer data, and certificate information across India',
    },
  },
];

@NgModule({
  declarations: [
    // Main component
    // Child components
  ],
  imports: [
    // Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    // Router module
    RouterModule.forChild(routes),

    // Third-party modules
    NgxEchartsModule.forChild(),
  ],
  providers: [
    // Services
    DashboardDataService,
  ],
})
export class PublicDashboardModule {}
