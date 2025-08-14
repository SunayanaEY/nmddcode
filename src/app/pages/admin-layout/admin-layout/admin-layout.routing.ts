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
import { ApprovedRejectedTrainingsComponent } from '../../training/approved-rejected-trainings/approved-rejected-trainings.component';

export const AdminLayoutRoutes: Routes = [
  {
    path: 'certificate-approval',
    component: CertificateApprovalComponent,
  },
  {
    path: 'user-profile-creation',
    loadComponent: () =>
      import(
        '../../user-profile-creation/user-profile-creation.component'
      ).then((m) => m.UserProfileCreationComponent),
  },
  {
    path: 'training-module',
    component: TrainingSectionComponent,
  },
  {
    path: 'training-certificate-generation',
    component: TrainingCertificateGenerationComponent,
  },
  {
    path: 'manual-training-upload',
    component: ManualTrainingUploadComponent,
  },
  {
    path: 'bulk-training-upload',
    component: BulkTrainingUploadComponent,
  },
  {
    path: 'approved-certificate',
    component: ApprovedCertificateComponent,
  },
  {
    path: 'all-trainings',
    component: AllTrainingsComponent,
  },
  {
    path: 'registered-data-entry-operators',
    component: RegisteredDataEntryOperatorsComponent,
  },
  {
    path: 'approvedrejectedTrainings',
    component: ApprovedRejectedTrainingsComponent,
  },
  {
    path: 'training-centre',
    loadComponent: () =>
      import('../../training/training-centre/training-centre.component').then(
        (m) => m.TrainingCentreComponent
      ),
  },
];
