import { Routes } from '@angular/router';
import { TrainingSectionComponent } from '../../training/training-section/training-section.component';
import { TrainingCertificateGenerationComponent } from '../../training/training-certificate-generation/training-certificate-generation.component';
import { ManualTrainingUploadComponent } from '../../training/manual-training-upload/manual-training-upload.component';
import { BulkTrainingUploadComponent } from '../../training/bulk-training-upload/bulk-training-upload.component';
import { ApprovedCertificateComponent } from '../../approved-certificate/approved-certificate.component';
import { CertificateApprovalComponent } from '../../certificate-approval/certificate-approval.component';
import { AllTrainingsComponent } from '../../training/all-trainings/all-trainings.component';
import { CertificateLayoutComponent } from '../../certificate-layout/certificate-layout.component';
import { SchemeManagementComponent } from '../scheme-management/scheme-management.component';
import { TrainingTypeManagementComponent } from '../training-type-management/training-type-management.component';
import { RegisteredDataEntryOperatorsComponent } from '../../training/registered-data-entry-operators/registered-data-entry-operators.component';
import { AllCertificateComponent } from '../../all-certificate/all-certificate.component';
import { ApprovedRejectedTrainingsComponent } from '../../training/approved-rejected-trainings/approved-rejected-trainings.component';
import { VerifyTrainingsComponent } from '../../training/verify-trainings/verify-trainings.component';
import { RoleGuard } from '../../../guards/role.guard';
import { ChangePasswordComponent } from '../../change-password/change-password.component';
import { AllTrainingsAdminComponent } from '../../training/all-trainings-admin/all-trainings-admin.component';
import { UpdateProfileComponent } from '../../training/update-profile/update-profile.component';
import { PublicDashboardComponent } from '../../public-dashboard/public-dashboard.component';
import { DashboardComponent } from '../../../dashboard/dashboard.component';

export const AdminLayoutRoutes: Routes = [
  // Central Admin Only Routes (Role 1)
  {
    path: 'scheme-management',
    component: SchemeManagementComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 5] },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1] },
  },
  {
    path: 'training-type-management',
    component: TrainingTypeManagementComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 5] },
  },
  {
    path: 'activity-log',
    loadComponent: () =>
      import('../../training/activity-log/activity-log.component').then(
        (m) => m.ActivityLogComponent
      ),
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 5] },
  },

  // Training Institute Head Routes (Role 3)
  {
    path: 'certificate-approval',
    component: CertificateApprovalComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 5] },
  },
  {
    path: 'user-profile-creation',
    loadComponent: () =>
      import(
        '../../user-profile-creation/user-profile-creation.component'
      ).then((m) => m.UserProfileCreationComponent),
    canActivate: [RoleGuard],
    data: { allowedRoles: [3] },
  },
  {
    path: 'add-trainers',
    loadComponent: () =>
      import(
        '../../training/add-trainers/add-trainers.component'
      ).then((m) => m.AddTrainersComponent),
    canActivate: [RoleGuard],
    data: { allowedRoles: [3] },
  },
  {
    path: 'training-module',
    component: TrainingSectionComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 3, 4, 5] },
  },
  {
    path: 'registered-data-entry-operators',
    component: RegisteredDataEntryOperatorsComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [3] },
  },
  {
    path: 'training-centre',
    loadComponent: () =>
      import('../../training/training-centre/training-centre.component').then(
        (m) => m.TrainingCentreComponent
      ),
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 5] },
  },
  {
    path: 'training-centre-admin-profile',
    loadComponent: () =>
      import(
        '../../training/training-centre-admin-profile/training-centre-admin-profile.component'
      ).then((m) => m.TrainingCentreAdminProfileComponent),
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 5] },
  },
  {
    path: 'update-profile',
    component: UpdateProfileComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [3] },
  },

  // Data Entry Operator Routes (Role 4)
  {
    path: 'training-certificate-generation',
    component: TrainingCertificateGenerationComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [4] },
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [] },
  },
  {
    path: 'manual-training-upload',
    component: ManualTrainingUploadComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [3, 4] },
  },
  {
    path: 'bulk-training-upload',
    component: BulkTrainingUploadComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [3, 4] },
  },

  // Shared Routes (Multiple Roles)
  {
    path: 'approved-certificate',
    component: ApprovedCertificateComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 3, 4, 5] },
  },
  {
    path: 'all-certificate',
    component: AllCertificateComponent,
  },
  {
    path: 'all-trainings',
    component: AllTrainingsComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 3, 4, 5] },
  },
  {
    path: 'all-trainings-admin',
    component: AllTrainingsAdminComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [1, 3, 5] },
  },
  {
    path: 'registered-data-entry-operators',
    component: RegisteredDataEntryOperatorsComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [3] },
  },
  {
    path: 'approvedrejectedTrainings',
    component: ApprovedRejectedTrainingsComponent,
    canActivate: [RoleGuard],
    data: { allowedRoles: [4] },
  },

  // Default route based on user role
  {
    path: 'verifyTrainings',
    component: VerifyTrainingsComponent,
  },
  {
    path: '',
    redirectTo: 'training-module',
    pathMatch: 'full',
  },
];
