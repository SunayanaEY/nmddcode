import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ChartSectionComponent } from './pages/charts/chart-section/chart-section.component';
import { TableSectionComponent } from './pages/table/table-section/table-section.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'charts', component: ChartSectionComponent
  },
  {
    path:'table-data',component: TableSectionComponent

  }
];
