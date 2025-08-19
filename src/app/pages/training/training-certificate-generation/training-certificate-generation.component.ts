import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-training-certificate-generation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadComponent,
    BreadcrumbComponent,
  ],
  templateUrl: './training-certificate-generation.component.html',
  styleUrl: './training-certificate-generation.component.css',
})
export class TrainingCertificateGenerationComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Certificate Generation' },
  ];
  trainingForm: FormGroup;
  signatures: any[] = [
    {
      file: null,
      name: '',
      designation: '',
      organization: '',
    },
  ];
  logos: any[] = [
    {
      file: null,
    },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.trainingForm = this.fb.group({
      trainingTitle: ['', Validators.required],
      scheme: ['', Validators.required],
      trainerName: ['', Validators.required],
      trainingInstituteName: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      block: ['', Validators.required],
      trainingDate: ['', Validators.required],
      duration: ['', Validators.required],
      durationType: ['Days', Validators.required],
      aboutTraining: ['', [Validators.required, Validators.maxLength(100)]],
      modeOfTraining: ['Classroom/ Field Demo/ Others', Validators.required],
    });
  }

  onFileSelect(file: File, type: 'signature' | 'logo', index: number) {
    if (type === 'signature') {
      this.signatures[index].file = file;
    } else {
      this.logos[index].file = file;
    }
  }

  removeSignature(index: number) {
    this.signatures[index].file = null;
  }

  removeLogo(index: number) {
    this.logos[index].file = null;
  }

  addMoreSignature() {
    this.signatures.push({
      file: null,
      name: '',
      designation: '',
      organization: '',
    });
  }

  addMoreLogo() {
    this.logos.push({
      file: null,
    });
  }

  onManualUpload() {
    this.router.navigate(['/admin/manual-training-upload']);
  }

  onBulkUpload() {
    this.router.navigate(['/admin/bulk-training-upload']);
  }

  goBack() {
    this.router.navigate(['/admin/training-module']);
  }

  onSignatureNameChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    this.signatures[index].name = target.value;
  }

  onSignatureDesignationChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    this.signatures[index].designation = target.value;
  }

  onSignatureOrganizationChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    this.signatures[index].organization = target.value;
  }

  private markFormGroupTouched() {
    Object.keys(this.trainingForm.controls).forEach((key) => {
      const control = this.trainingForm.get(key);
      control?.markAsTouched();
    });
  }
}
