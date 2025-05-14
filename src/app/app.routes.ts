import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ChartSectionComponent } from './pages/charts/chart-section/chart-section.component';
import { TableSectionComponent } from './pages/table/table-section/table-section.component';
import { ChartPageComponent } from './pages/charts/chart-page/chart-page.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>import('./pages/admin-layout/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule)
      }
    ]
    //canDeactivate: [CanDeactivateGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },


];
