import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { SchemeService } from '../../training/services/scheme.service';
import { TrainingService } from '../../../pages/training/services/training.service';
import {
  LocationService,
  State,
  District,
} from '../../../services/location.service';
import { ToastrService } from 'ngx-toastr';
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
export class TrainingCertificateGenerationComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Certificate Generation' },
  ];
  trainingForm: FormGroup;
  schemes: any;
  logo1!: File;
  logo2!: File;
  logo3!: File;

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
  states: State[] = [];
  districts: District[] = [];
  instituteNames: any;
  isLoadingStates = false;
  isLoadingDistricts = false;
  selectedState: any;
  selectedDistrict: any;
  allTrainingType: any;
  isSpinner: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private schemeService: SchemeService,
    private toastr: ToastrService,
    private locationService: LocationService,
    private trainingService: TrainingService
  ) {
    this.trainingForm = this.fb.group({
      trainingTitle: ['', Validators.required],
      scheme: ['', Validators.required],
      trainerName: ['', Validators.required],
      trainingInstituteName: ['', Validators.required],
      venueState: ['', Validators.required],
      venueDistrict: ['', Validators.required],
      venueBlock: ['', Validators.required],
      trainingDate: ['', Validators.required],
      duration: ['', Validators.required],
      durationType: ['Days', Validators.required],
      trainingDescription: [
        '',
        [Validators.required, Validators.maxLength(100)],
      ],
      trainingType: ['Classroom/ Field Demo/ Others', Validators.required],
      modeOfTraining: ['online/ offline/ field/ hybrid', Validators.required],
    });
  }
  ngOnInit() {
    this.getSchemes();
    this.getInstituteNames();
    this.loadStates();
    this.getTrainingTypes();
  }
  getSchemes(): void {
    this.schemeService.getAllSchemes().subscribe({
      next: (res) => {
        this.schemes = res;
        console.log('Schemes fetched:', this.schemes);
      },
      error: (err) => {
        console.error('Error fetching schemes:', err);
      },
    });
  }
  getInstituteNames(): void {
    this.trainingService.getAllInstitutes().subscribe({
      next: (res) => {
        this.instituteNames = res.data;
        console.log('Institutes fetched:', this.instituteNames);
      },
      error: (err) => {
        console.error('Error fetching institutes:', err);
      },
    });
  }
  onStateSelected(stateId: any) {
    // this.selectedState = state.stateName;
    // alert(JSON.stringify(stateId));
    this.loadDistricts(stateId);
  }
  onDistrictSelect(district: any) {
    this.selectedDistrict = district;
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
  loadStates() {
    this.isLoadingStates = true;
    this.locationService.getStates().subscribe({
      next: (states) => {
        this.states = states;
        this.isLoadingStates = false;
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.toastr.error('Failed to load states', 'Error');
        this.isLoadingStates = false;
      },
    });
  }
  loadDistricts(stateId: number) {
    this.isLoadingDistricts = true;
    this.districts = []; // Clear existing districts

    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts) => {
        this.districts = districts;
        this.isLoadingDistricts = false;
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        this.toastr.error('Failed to load districts', 'Error');
        this.isLoadingDistricts = false;
      },
    });
  }

  getTrainingTypes(): void {
    this.trainingService.getTrainingTypes().subscribe({
      next: (res) => {
        this.allTrainingType = res;
        console.log('Training Types fetched:', this.instituteNames);
      },
      error: (err) => {
        console.error('Error fetching institutes:', err);
      },
    });
  }
  onManualUpload() {
    // if (this.trainingForm.invalid) {
    //   this.trainingForm.markAllAsTouched();
    //   return;
    // }

    const formData = this.trainingForm.value;
    const payload = new FormData();

    const data: any = {};
    Object.keys(formData).forEach((key) => {
      data[key] = formData[key];
    });
    if (data.hasOwnProperty('venueState')) {
      data['venueStateId'] = data['venueState'];
      delete data['venueState'];
    }

    if (data.hasOwnProperty('venueDistrict')) {
      data['venueDistrictId'] = data['venueDistrict'];
      delete data['venueDistrict'];
    }

    if (data.hasOwnProperty('scheme')) {
      data['schemeId'] = data['scheme'];
      delete data['scheme'];
    }

    if (data.hasOwnProperty('trainingType')) {
      data['trainingTypeId'] = data['trainingType'];
      delete data['trainingType'];
    }

    const signatories = this.signatures
      .filter((sig) => sig.name && sig.designation && sig.organization) // keep only valid entries
      .map((sig) => ({
        signatoryName: sig.name,
        signatoryDesignation: sig.designation,
        signatoryOrganization: sig.organization,
      }));

    if (signatories.length > 0) {
      data['signatories'] = signatories;
    }

    const logos = [0, 1, 2]
      .map((i) =>
        this.logos[i] && this.logos[i].file ? this.logos[i].file : null
      )
      .filter((file) => file !== null);

    if (logos.length > 0) {
      logos.forEach((logo) => {
        payload.append('logos', logo);
      });
    }

    payload.append('data', JSON.stringify(data));

    this.signatures.forEach((item) => {
      if (item.file) {
        payload.append('signatures', item.file);
      }
    });
    this.isSpinner = true;
    this.trainingService.saveTraining(payload).subscribe({
      next: (response) => {
        this.toastr.success('Training Details Saved Successfully!', 'Success');
        const trainingId = response.data.id;
        this.router.navigate(['/admin/manual-training-upload'], {
          queryParams: { trainingId: trainingId },
        });
        this.isSpinner = false;
      },
      error: (error) => {
        this.isSpinner = false;
        this.toastr.error('Failed to save training', 'Error');
      },
    });
    const trainingId = 10;
    this.router.navigate(['/admin/manual-training-upload'], {
      queryParams: { trainingId: trainingId },
    });
  }

  onBulkUpload() {
    const trainingId = 10;
    this.router.navigate(['/admin/bulk-training-upload'], {
      queryParams: { trainingId: trainingId },
    });
    this.isSpinner = false;
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
