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
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  signaturesNew: any[] = [
    {
      file: null,
      name: '',
      designation: '',
      organization: '',
    },
  ];
  logosNew: any[] = [
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
  selectedTrainingInstituteName: any;
  selectedTrainingInstituteId: any;
  isSpinner: boolean = false;
  trainingId: any = null;
  trainingDetails: any = null;
  mySelectedFile: any[] = [];
  mySelectedLogo: any[] = [];

  signature_1_id: number = 0;
  signature_2_id: number = 0;

  populate: any = 'false';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private schemeService: SchemeService,
    private toastr: ToastrService,
    private locationService: LocationService,
    private trainingService: TrainingService,
    private route: ActivatedRoute
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
      trainingType: ['', Validators.required],
      modeOfTraining: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.getSchemes();
    this.getInstituteNames();
    this.loadStates();
    this.getTrainingTypes();
    this.trainingId = this.route.snapshot.queryParams['trainingId'];
    this.populate = this.route.snapshot.queryParams['populate'];

    if (this.trainingId != null || this.trainingId != undefined) {
      this.getTrainingDetails(this.trainingId);
    } else {
      this.mySelectedFile.push('');
      this.mySelectedLogo.push('');
    }
  }
  getTrainingDetails(trainingId: number) {
    // alert('Training Upload : ' + trainingId);
    this.isSpinner = true;
    this.trainingService.getTrainingDetails(trainingId).subscribe({
      next: (response) => {
        this.isSpinner = false;
        console.log(response);
        this.trainingDetails = response;
        const formattedDate = this.trainingDetails.trainingDate.split('T')[0];
        this.trainingForm.patchValue({
          trainingTitle: this.trainingDetails.trainingTitle,
          scheme: this.trainingDetails.schemeId,
          trainerName: this.trainingDetails.trainerName,
          venueState: this.trainingDetails.venueStateId,
          venueBlock: this.trainingDetails.venueBlock,
          trainingDate: formattedDate,
          duration: this.trainingDetails.duration,
          durationType: this.trainingDetails.durationType,
          trainingDescription: this.trainingDetails.trainingDescription,
          trainingType: this.trainingDetails.trainingTypeId,
          modeOfTraining: this.trainingDetails.modeOfTraining,
        });
        this.loadDistricts(this.trainingDetails.venueStateId);
        this.trainingForm.patchValue({
          venueDistrict: this.trainingDetails.venueDistrictId,
        });
        if (this.trainingDetails?.signatures?.length > 0) {
          this.signatures = this.trainingDetails.signatures.map((s: any) => ({
            id: s.id,
            name: s.signatoryName,
            designation: s.signatoryDesignation,
            organization: s.signatoryOrganization,
          }));
          this.signaturesNew = this.trainingDetails.signatures.map(
            (s: any) => ({
              id: s.id,
              name: s.signatoryName,
              designation: s.signatoryDesignation,
              organization: s.signatoryOrganization,
              signatorySignaturePath: s.signatorySignaturePath,
            })
          );

          this.mySelectedFile = this.trainingDetails.signatures.map(
            (s: any) => s.signatorySignaturePath
          );

          console.log(this.mySelectedFile);
        }
        this.mySelectedLogo = [
          this.trainingDetails.logoPath1,
          this.trainingDetails.logoPath2,
          this.trainingDetails.logoPath3,
        ].filter((logo: string | null) => logo !== null);
        console.log(this.mySelectedLogo);
        this.logos = this.mySelectedLogo.map((logo: string, index: number) => ({
          id: index + 1, // optional: keep track of logo index
          path: logo,
        }));
      },
      error: (error) => {
        this.isSpinner = false;
      },
    });
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
    if (this.populate == 'false') {
      if (type === 'signature') {
        this.signatures[index].file = file;
      } else {
        this.logos[index].file = file;
      }
    } else {
      if (type === 'signature') {
        this.signaturesNew[index].file = file;
        console.log(JSON.stringify(this.signaturesNew[index]));
      } else {
        this.logosNew[index].file = file;
      }
    }
  }

  removeSignature(index: number) {
    if (this.populate == 'false') {
      this.signatures[index].file = null;
    } else {
      this.signaturesNew[index].file = null;
    }
  }

  removeLogo(index: number) {
    if (this.populate == 'false') {
      this.logos[index].file = null;
    } else {
      this.logosNew[index].file = null;
    }
  }

  addMoreSignature() {
    this.signatures.push({
      file: null,
      name: '',
      designation: '',
      organization: '',
    });
    this.mySelectedFile.push('');
  }

  addMoreLogo() {
    this.logos.push({
      file: null,
    });
    this.mySelectedLogo.push('');
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
  onTrainingInstituteChange() {
    const selectedInstitute = this.trainingForm.get(
      'trainingInstituteName'
    )?.value;
    this.selectedTrainingInstituteName =
      selectedInstitute.trainingInstituteName;
    this.selectedTrainingInstituteId = selectedInstitute.id;
  }
  onManualUpload() {
    if (this.trainingForm.invalid) {
      this.trainingForm.markAllAsTouched();
      return;
    }

    const formData = this.trainingForm.value;
    const payload = new FormData();

    const data: any = {};
    Object.keys(formData).forEach((key) => {
      data[key] = formData[key];
    });

    if (data.hasOwnProperty('trainingInstituteName')) {
      data['trainingInstituteName'] = this.selectedTrainingInstituteName;
    }
    data['trainingInstituteId'] = this.selectedTrainingInstituteId;

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
    // alert('coming to : ' + this.populate);
    if (this.populate == 'true') {
      // alert('coming here !!');
      data['id'] = this.trainingId;
      const signatories = this.signaturesNew
        .filter((sig) => sig.name && sig.designation && sig.organization) // keep only valid entries
        .map((sig, index) => ({
          id: sig.id,
          signatoryName: sig.name,
          signatoryDesignation: sig.designation,
          signatoryOrganization: sig.organization,
          signatorySignaturePath: sig.signatorySignaturePath,
          fileName: sig.file ? `signatures${index + 1}` : null,
        }));
      console.log('Coming here !!');
      console.log(JSON.stringify(signatories[0]));

      if (signatories.length > 0) {
        data['signatories'] = signatories;
      }

      payload.append('data', JSON.stringify(data));

      this.signaturesNew.forEach((item, index) => {
        if (item.file) {
          payload.append(`signatures${index + 1}`, item.file); // if file exists
        }
      });

      this.logosNew.forEach((item, index) => {
        if (item && item.file) {
          payload.append(`logos${index + 1}`, item.file); // logos1, logos2, logos3
        } else {
          payload.append(`logos${index + 1}`, ''); // empty string if no file
        }
      });

      this.isSpinner = true;
      this.trainingService.updateTraining(payload).subscribe({
        next: (response) => {
          this.toastr.success(
            'Training Details Updated Successfully!',
            'Success'
          );
          const trainingId = response.data.id;
          this.router.navigate(['/admin/manual-training-upload'], {
            queryParams: { trainingId: trainingId },
          });
          this.isSpinner = false;
        },
        error: (error) => {
          this.isSpinner = false;
          this.toastr.error('Failed to update training', 'Error');
        },
      });
    } else {
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
          this.toastr.success(
            'Training Details Saved Successfully!',
            'Success'
          );
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
    }
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
    if (this.populate == 'false') {
      this.signatures[index].name = target.value;
    } else {
      this.signaturesNew[index].name = target.value;
    }
  }

  onSignatureDesignationChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    if (this.populate == 'false') {
      this.signatures[index].designation = target.value;
    } else {
      this.signaturesNew[index].designation = target.value;
    }
  }

  onSignatureOrganizationChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    if (this.populate == 'false') {
      this.signatures[index].organization = target.value;
    } else {
      this.signaturesNew[index].organization = target.value;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.trainingForm.controls).forEach((key) => {
      const control = this.trainingForm.get(key);
      control?.markAsTouched();
    });
  }
}
