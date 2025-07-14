import { Routes } from "@angular/router";
import { TrainingSectionComponent } from "../../training/training-section/training-section.component";
import { TrainingCertificateGenerationComponent } from "../../training/training-certificate-generation/training-certificate-generation.component";
import { ManualTrainingUploadComponent } from "../../training/manual-training-upload/manual-training-upload.component";
import { BulkTrainingUploadComponent } from "../../training/bulk-training-upload/bulk-training-upload.component";
import { ApprovedCertificateComponent } from "../../approved-certificate/approved-certificate.component";

export const AdminLayoutRoutes: Routes = [
  {
    path: 'training-module', component: TrainingSectionComponent
  },
  {
    path: 'training-certificate-generation', component: TrainingCertificateGenerationComponent
  },
  {
    path: 'manual-training-upload', component: ManualTrainingUploadComponent
  },
  {
    path: 'bulk-training-upload', component: BulkTrainingUploadComponent
  },
  {
    path: 'approved-certificate', component: ApprovedCertificateComponent
  },
];
