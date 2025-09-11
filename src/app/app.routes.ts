import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout/admin-layout.component';
import { SchemeManagementComponent } from './pages/admin-layout/scheme-management/scheme-management.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { AuthGuard } from './guards/auth.guard';
import { VerifyCertificateComponent } from './pages/verify-certificate/verify-certificate.component';

export const routes: Routes = [
  // Public Dashboard - Landing Page
  // {
  //   path: '',
  //   loadChildren: () =>
  //     import('./pages/public-dashboard/public-dashboard.module').then(
  //       (m) => m.PublicDashboardModule
  //     ),
  //   data: {
  //     title: 'National Dairy Development Programme - Public Dashboard',
  //     description: 'View training statistics and farmer data across India',
  //   },
  // },

  // Authentication
  { path:'', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: LoginComponent }, // TODO: Create separate signup component
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'verify-certificate', component: VerifyCertificateComponent },

  // Unauthorized access
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },

  // Admin Dashboard
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/admin-layout/admin-layout/admin-layout.module').then(
            (x) => x.AdminLayoutModule
          ),
      },
    ],
  },

  // Legacy route redirect
  { path: 'dashboard', redirectTo: 'admin', pathMatch: 'full' },

  // Wildcard route - should be last
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
