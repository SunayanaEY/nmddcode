import { Routes } from '@angular/router';
import { ChartSectionComponent } from './pages/charts/chart-section/chart-section.component';
import { TableSectionComponent } from './pages/table/table-section/table-section.component';

export const routes: Routes = [
  {
    path: 'charts', component: ChartSectionComponent
  },
  {
    path:'table-data',component: TableSectionComponent

  }
];
