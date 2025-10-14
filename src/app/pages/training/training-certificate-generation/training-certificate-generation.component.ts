import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
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
import { AdminService } from '../services/training-admin.service';

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
    { label: 'Schedule Training' },
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
  trainers: any[] = [];
  isLoadingTrainers = false;
  showGuestTrainerField = false;
  isSpinner: boolean = false;
  trainingId: any = null;
  trainingDetails: any = null;
  mySelectedFile: any[] = [];
  mySelectedLogo: any[] = [];

  signature_1_id: number = 0;
  signature_2_id: number = 0;

  populate: any = 'false';
  signatureValidationError: string = '';
  logoValidationError: string = '';
  signatureFieldErrors: {
    [key: number]: {
      name: boolean;
      designation: boolean;
      organization: boolean;
    };
  } = {};

  // Custom validators
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (selectedDate < today) {
      return { pastDate: true };
    }
    
    return null;
  }

  positiveDurationValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }
    
    const duration = Number(control.value);
    
    if (duration <= 0) {
      return { invalidDuration: true };
    }
    
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private schemeService: SchemeService,
    private toastr: ToastrService,
    private locationService: LocationService,
    private trainingService: TrainingService,
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {
    this.trainingForm = this.fb.group({
      trainingTitle: ['', Validators.required],
      scheme: ['', Validators.required],
      trainerName: ['', Validators.required],
      guestTrainerName: [''],
      trainingInstituteName: ['', Validators.required],
      venueState: ['', Validators.required],
      venueDistrict: ['', Validators.required],
      venueBlock: ['', Validators.required],
      trainingDate: ['', [Validators.required, this.futureDateValidator.bind(this)]],
      duration: ['', [Validators.required, this.positiveDurationValidator.bind(this)]],
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
    this.loadTrainers();
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
        this.trainingDetails = response;
        const formattedDate = this.trainingDetails.trainingDate.split('T')[0];
        // Handle trainer selection based on trainerId
        if (this.trainingDetails.trainerId === 0) {
          // Guest trainer case
          this.showGuestTrainerField = true;
          this.trainingForm.patchValue({
            trainerName: 'Other',
            guestTrainerName: this.trainingDetails.trainerName,
          });
          // Update validation for guest trainer
          this.trainingForm.get('guestTrainerName')?.setValidators([Validators.required]);
          this.trainingForm.get('guestTrainerName')?.updateValueAndValidity();
        } else {
          // Regular trainer case
          this.showGuestTrainerField = false;
          this.trainingForm.patchValue({
            trainerName: this.trainingDetails.trainerName,
          });
          // Remove validation for guest trainer
          this.trainingForm.get('guestTrainerName')?.clearValidators();
          this.trainingForm.get('guestTrainerName')?.updateValueAndValidity();
        }

        this.trainingForm.patchValue({
          trainingTitle: this.trainingDetails.trainingTitle,
          scheme: this.trainingDetails.schemeId,
          venueState: this.trainingDetails.venueStateId,
          venueBlock: this.trainingDetails.venueBlock,
          trainingDate: formattedDate,
          duration: this.trainingDetails.duration,
          durationType: this.trainingDetails.durationType,
          trainingDescription: this.trainingDetails.trainingDescription,
          trainingType: this.trainingDetails.trainingTypeId,
          modeOfTraining: this.trainingDetails.modeOfTraining,
        });

        // Set training institute after institutes are loaded
        this.setTrainingInstitute();
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

        }
        this.mySelectedLogo = [
          this.trainingDetails.logoPath1,
          this.trainingDetails.logoPath2,
          this.trainingDetails.logoPath3,
        ].filter((logo: string | null) => logo !== null);
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

  setTrainingInstitute(): void {
    if (this.trainingDetails && this.instituteNames) {
      const selectedInstitute = this.instituteNames.find(
        (institute: any) => institute.id === this.trainingDetails.trainingInstituteId
      );
      
      if (selectedInstitute) {
        this.trainingForm.patchValue({
          trainingInstituteName: selectedInstitute
        });
      } else {
        // If institute not found in list, create a temporary object
        const tempInstitute = {
          id: this.trainingDetails.trainingInstituteId,
          trainingInstituteName: this.trainingDetails.trainingInstituteName
        };
        this.trainingForm.patchValue({
          trainingInstituteName: tempInstitute
        });
      }
    }
  }

  getSchemes(): void {
    this.schemeService.getAllSchemes().subscribe({
      next: (res) => {
        this.schemes = res;
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
        // Set training institute if training details are already loaded
        if (this.trainingDetails) {
          this.setTrainingInstitute();
        }
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

    // Check if we're in update mode (populate is 'true') or create mode (populate is 'false', undefined, or null)
    if (this.populate === 'true') {
      if (type === 'signature') {
        this.signaturesNew[index].file = file;
        // Clear validation error when file is uploaded
        this.signatureValidationError = '';
      } else {
        this.logosNew[index].file = file;
      }
    } else {
      // Create mode (populate is 'false', undefined, or null)
      if (type === 'signature') {
        this.signatures[index].file = file;
        // Clear validation error when file is uploaded
        this.signatureValidationError = '';
      } else {
        this.logos[index].file = file;
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
      },
      error: (err) => {
        console.error('Error fetching institutes:', err);
      },
    });
  }

  loadTrainers(): void {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const trainingHeadId = userData.trainingHeadId;
    if (!trainingHeadId) {
      this.toastr.error('Training Head ID not found in session');
      return;
    }

    this.isLoadingTrainers = true;
    this.adminService.getTrainersByTrainingHead(trainingHeadId).subscribe({
      next: (response) => {
        this.trainers = response.data || [];
        this.isLoadingTrainers = false;
      },
      error: (error) => {
        console.error('Error loading trainers:', error);
        this.toastr.error('Failed to load trainers');
        this.isLoadingTrainers = false;
      }
    });
   }

   onTrainerChange(): void {
     const selectedTrainer = this.trainingForm.get('trainerName')?.value;
     this.showGuestTrainerField = selectedTrainer === 'Other';
     
     const guestTrainerControl = this.trainingForm.get('guestTrainerName');
     if (this.showGuestTrainerField) {
       guestTrainerControl?.setValidators([Validators.required]);
     } else {
       guestTrainerControl?.clearValidators();
       guestTrainerControl?.setValue('');
     }
     guestTrainerControl?.updateValueAndValidity();
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

    // Validate signature and logo uploads
    if (!this.validateSignatureUpload()) {
      return;
    }

    if (!this.validateSignatureFields()) {
      return;
    }

    if (!this.validateLogoUpload()) {
      return;
    }

    const formData = this.trainingForm.value;
    const payload = new FormData();
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');

    const data: any = {};
    Object.keys(formData).forEach((key) => {
      data[key] = formData[key];
    });

    if (data.hasOwnProperty('trainingInstituteName')) {
      data['trainingInstituteName'] = this.selectedTrainingInstituteName;
    }
    data['trainingInstituteId'] = this.selectedTrainingInstituteId;
    // Get data from session storage

    // Assign trainingManagerId
    data['trainingManagerId'] = userData.trainingManagerId;

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

    // Handle trainer data based on selection
    if (data.hasOwnProperty('trainerName')) {
      if (data['trainerName'] === 'Other') {
        // When "Other" is selected, use guest trainer name and set trainerId to 0
        data['trainerName'] = data['guestTrainerName'];
        data['trainerId'] = 0;
      } else {
        // When specific trainer is selected, find trainerId and set trainerName to null
        const selectedTrainer = this.trainers.find(trainer => trainer.trainerName === data['trainerName']);
        data['trainerId'] = selectedTrainer ? selectedTrainer.id : null;
        data['trainerName'] = null;
      }
      // Remove guestTrainerName from final data
      delete data['guestTrainerName'];
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
          this.router.navigate(['/admin/training-module'], {
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
          this.router.navigate(['/admin/training-module'], {
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
    if (this.trainingForm.invalid) {
      this.trainingForm.markAllAsTouched();
      return;
    }
    const trainingId = this.trainingId;
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
    if (this.populate === 'true') {
      this.signaturesNew[index].name = target.value;
    } else {
      this.signatures[index].name = target.value;
    }

    // Clear validation error for this field
    if (this.signatureFieldErrors[index]) {
      this.signatureFieldErrors[index].name = false;
    }
  }

  onSignatureDesignationChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    if (this.populate === 'true') {
      this.signaturesNew[index].designation = target.value;
    } else {
      this.signatures[index].designation = target.value;
    }

    // Clear validation error for this field
    if (this.signatureFieldErrors[index]) {
      this.signatureFieldErrors[index].designation = false;
    }
  }

  onSignatureOrganizationChange(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    if (this.populate === 'true') {
      this.signaturesNew[index].organization = target.value;
    } else {
      this.signatures[index].organization = target.value;
    }

    // Clear validation error for this field
    if (this.signatureFieldErrors[index]) {
      this.signatureFieldErrors[index].organization = false;
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.trainingForm.controls).forEach((key) => {
      const control = this.trainingForm.get(key);
      control?.markAsTouched();
    });
  }

  validateSignatureUpload(): boolean {
    this.signatureValidationError = '';

    if (this.populate === 'true') {
      // For update mode, check signaturesNew array
      const hasValidSignature = this.signaturesNew.some(
        (sig) => sig.file || sig.signatorySignaturePath
      );

      if (!hasValidSignature) {
        this.signatureValidationError = 'At least 1 signature is required';
        return false;
      }
    } else {
      // Create mode (populate is 'false', undefined, or null)
      const hasValidSignature = this.signatures.some((sig) => sig.file);

      if (!hasValidSignature) {
        this.signatureValidationError = 'At least 1 signature is required';
        return false;
      }
    }

    return true;
  }

  validateSignatureFields(): boolean {
    this.signatureFieldErrors = {};
    let isValid = true;

    const signaturesArray =
      this.populate === 'true' ? this.signaturesNew : this.signatures;

    signaturesArray.forEach((signature, index) => {
      // Only validate fields if a signature file is uploaded or exists
      const hasSignatureFile =
        signature.file || signature.signatorySignaturePath;

      if (hasSignatureFile) {
        const errors = {
          name: !signature.name || signature.name.trim() === '',
          designation:
            !signature.designation || signature.designation.trim() === '',
          organization:
            !signature.organization || signature.organization.trim() === '',
        };

        if (errors.name || errors.designation || errors.organization) {
          this.signatureFieldErrors[index] = errors;
          isValid = false;
        }
      }
    });

    return isValid;
  }

  validateLogoUpload(): boolean {
    this.logoValidationError = '';

    if (this.populate === 'true') {
      // For update mode, check logosNew array and mySelectedLogo
      const hasValidLogo =
        this.logosNew.some((logo) => logo.file) ||
        this.mySelectedLogo.some((logo) => logo);

      if (!hasValidLogo) {
        this.logoValidationError = 'At least 1 logo is required';
        return false;
      }
    } else {
      // For create mode, check logos array
      const hasValidLogo = this.logos.some((logo) => logo.file);

      if (!hasValidLogo) {
        this.logoValidationError = 'At least 1 logo is required';
        return false;
      }
    }

    return true;
  }
}
