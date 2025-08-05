import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout/admin-layout.component';
import { SchemeManagementComponent } from './pages/admin-layout/scheme-management/scheme-management.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>import('./pages/admin-layout/admin-layout/admin-layout.module').then(x => x.AdminLayoutModule)
      }
    ]
  }
];
