import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormArray,
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
import { MultiSelectDropdownComponent } from '../../../components/multi-select-dropdown/multi-select-dropdown.component';
import { LatestCertificateLayoutComponent } from '../../latest-certificate-layout/latest-certificate-layout.component';
import { environment } from '../../../../environments/environment';
import {
  CroppedImageResult,
  ImageCropperModalComponent,
} from '../../../components/image-cropper-modal/image-cropper-modal.component';

@Component({
  selector: 'app-training-certificate-generation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadComponent,
    BreadcrumbComponent,
    TranslateModule,
    MultiSelectDropdownComponent,
    LatestCertificateLayoutComponent,
    ImageCropperModalComponent,
  ],
  templateUrl: './training-certificate-generation.component.html',
  styleUrl: './training-certificate-generation.component.css',
})
export class TrainingCertificateGenerationComponent implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/admin/role-dashboard' },
    { label: 'Schedule Training' },
  ];
  trainingForm: FormGroup;
  schemes: any;
  apiUrl = environment.apiUrl;
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
    {
      file: null,
    },
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
    {
      file: null,
    },
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
  selectedTrainers: any[] = [];
  isLoadingTrainers = false;
  showGuestTrainerField = false;
  isSpinner: boolean = false;
  trainingId: any = null;
  trainingDetails: any = null;
  mySelectedFile: any[] = ['', ''];
  mySelectedLogo: any[] = ['', '', ''];
  trainingScheduleFile: File | null = null;
  existingTrainingSchedulePath: string = '';
  trainingSchedulePreviewUrl: string = '';
  trainingScheduleDownloadName: string = '';
  showScheduleError: boolean = false;

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

  previewData: any = null;
  showPreview: boolean = false;
  previewUniqueId: string = 'PREVIEW-UIN-000000';
  private previewBlobUrls: string[] = [];
  showImageCropper = false;
  cropperInputFile: File | null = null;
  cropperOriginalFileName = 'certificate-image.png';
  cropperTargetType: 'signature' | 'logo' = 'signature';
  cropperTargetIndex = 0;
  instituteType: string = '';

  private buildLogoUrl(raw?: string | null): string {
    const path = (raw || '').toString().trim();
    if (!path) return '';
    try {
      const u = new URL(path);
      if (u.protocol === 'http:' || u.protocol === 'https:') {
        return path;
      }
    } catch {}
    if (path.startsWith('/')) {
      return `${this.apiUrl}${path.replace(/^\/+/, '')}`;
    }
    return `${this.apiUrl}api/photo/download/${encodeURIComponent(path)}`;
  }

  // Custom validators
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Allow dates from past 45 days up to any future date
    const pastLimit = new Date(today);
    pastLimit.setDate(pastLimit.getDate() - 45);

    if (selectedDate < pastLimit) {
      return { invalidDateRange: true };
    }

    return null;
  }

  positiveDurationValidator(control: AbstractControl): ValidationErrors | null {
    if (
      control.value === null ||
      control.value === undefined ||
      control.value === ''
    ) {
      return null; // Let required validator handle empty values
    }

    const value = Number(control.value);
    if (isNaN(value) || value <= 0) {
      return { invalidDuration: true };
    }

    return null;
  }

  endDateAfterStartValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    // If either date is missing, don't flag this validator
    if (!start || !end) {
      // Clear any previous endBeforeStart error
      const endCtrl = group.get('endDate');
      const currentErrors = endCtrl?.errors || null;
      if (currentErrors && currentErrors['endBeforeStart']) {
        delete currentErrors['endBeforeStart'];
        endCtrl?.setErrors(
          Object.keys(currentErrors).length ? currentErrors : null,
        );
      }
      return null;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < startDate) {
      const endCtrl = group.get('endDate');
      const currentErrors = endCtrl?.errors || {};
      endCtrl?.setErrors({ ...currentErrors, endBeforeStart: true });
      return { endBeforeStart: true };
    }

    // Clear the error if dates are valid
    const endCtrl = group.get('endDate');
    const currentErrors = endCtrl?.errors || null;
    if (currentErrors && currentErrors['endBeforeStart']) {
      delete currentErrors['endBeforeStart'];
      endCtrl?.setErrors(
        Object.keys(currentErrors).length ? currentErrors : null,
      );
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
    private adminService: AdminService,
  ) {
    this.trainingForm = this.fb.group(
      {
        trainingTitle: ['', Validators.required],
        scheme: ['', Validators.required],
        trainerName: ['', Validators.required],
        guestTrainerName: [''],
        trainingInstituteName: ['', Validators.required],
        venueState: ['', Validators.required],
        venueDistrict: ['', Validators.required],
        venueBlock: [''],
        venueAddress: ['', Validators.required],
        duration: [
          '',
          [Validators.required, this.positiveDurationValidator.bind(this)],
        ],
        durationType: ['Hours', Validators.required],
        trainingDescription: [
          '',
          [Validators.required, Validators.maxLength(100)],
        ],
        trainingType: ['', Validators.required],
        modeOfTraining: ['', Validators.required],
        trainingRegion: ['D', Validators.required],
        dateRanges: this.fb.array(
          [],
          [Validators.required, Validators.minLength(1)],
        ),
      },
      { validators: [this.noOverlapValidator.bind(this)] },
    );
  }
  ngOnInit() {
    this.loadInstituteTypeFromSession();
    this.addDateRange();
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
      this.mySelectedFile = ['', ''];
      this.mySelectedLogo = ['', '', ''];
    }
  }

  ngOnDestroy(): void {
    this.revokeTrainingSchedulePreviewUrl();
    this.cleanupPreviewBlobUrls();
  }

  get secondarySignatureSectionTitle(): string {
    const normalizedType = (this.instituteType || '').trim().toLowerCase();
    if (normalizedType === 'other organizations') {
      return "Other Organization Head's Section";
    }
    return "State Head's Section";
  }

  private loadInstituteTypeFromSession(): void {
    try {
      const userDataRaw = sessionStorage.getItem('user');
      if (!userDataRaw) {
        this.instituteType = '';
        return;
      }
      const userData = JSON.parse(userDataRaw);
      this.instituteType = (userData?.instituteType || '').toString();
    } catch {
      this.instituteType = '';
    }
  }

  validateBlockInput(event: any) {
    const input = event.target;
    const value = input.value;
    // Allow alphabets, numbers, and spaces
    const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '');

    if (value !== sanitizedValue) {
      input.value = sanitizedValue;
      this.trainingForm.get('venueBlock')?.setValue(sanitizedValue);
    }
  }

  onTrainerSelectionChange(selectedTrainers: any[]) {
    this.selectedTrainers = selectedTrainers;
    // Trainer names are now written by the dropdown via ControlValueAccessor
    const guestTrainerControl = this.trainingForm.get('guestTrainerName');
    // Detect if "Other" is among selected trainers
    const hasOther =
      Array.isArray(selectedTrainers) &&
      selectedTrainers.some((t: any) => {
        if (t && typeof t === 'object') {
          return t.name === 'Other' || t.trainerName === 'Other';
        }
        return t === 'Other';
      });

    this.showGuestTrainerField = !!hasOther;

    if (this.showGuestTrainerField) {
      guestTrainerControl?.setValidators([Validators.required]);
    } else {
      guestTrainerControl?.clearValidators();
      guestTrainerControl?.setValue('');
    }
    guestTrainerControl?.updateValueAndValidity();
  }

  getTrainingDetails(trainingId: number) {
    // alert('Training Upload : ' + trainingId);
    this.isSpinner = true;
    this.trainingService.getTrainingDetails(trainingId).subscribe({
      next: (response) => {
        this.isSpinner = false;
        this.trainingDetails = response;
        // const formattedDate = this.trainingDetails.startDate.split('T')[0];
        // Handle trainer selection based on trainerId
        if (this.trainingDetails.trainerId === 0) {
          // Guest trainer case
          this.showGuestTrainerField = true;
          this.trainingForm.patchValue({
            trainerName: 'Other',
            guestTrainerName: this.trainingDetails.trainerName,
          });
          // Update validation for guest trainer
          this.trainingForm
            .get('guestTrainerName')
            ?.setValidators([Validators.required]);
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
          venueAddress: this.trainingDetails.venueAddress,
          duration: this.trainingDetails.duration,
          durationType: this.trainingDetails.durationType,
          trainingDescription: this.trainingDetails.trainingDescription,
          trainingType: this.trainingDetails.trainingTypeId,
          modeOfTraining: this.trainingDetails.modeOfTraining,
          trainingRegion:
            this.trainingDetails.trainingRegion === 'IN'
              ? 'F'
              : this.trainingDetails.trainingRegion === 'BH'
                ? 'D'
                : this.trainingDetails.trainingRegion || 'D',
        });

        // Clear existing date ranges and repopulate with top-level dates from API
        this.dateRanges.clear();
        const startDateStr = this.trainingDetails.startDate
          ? String(this.trainingDetails.startDate).split('T')[0]
          : '';
        const endDateStr = this.trainingDetails.endDate
          ? String(this.trainingDetails.endDate).split('T')[0]
          : '';
        this.addDateRange(startDateStr, endDateStr);

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
            }),
          );

          this.mySelectedFile = this.trainingDetails.signatures.map((s: any) =>
            this.buildLogoUrl(s.signatorySignaturePath),
          );
        }

        if (this.trainingDetails.trainingScheduleDetail) {
          this.existingTrainingSchedulePath =
            this.trainingDetails.trainingScheduleDetail;
          this.prepareTrainingSchedulePreview();
        } else {
          this.existingTrainingSchedulePath = '';
          this.revokeTrainingSchedulePreviewUrl();
        }

        this.mySelectedLogo = [
          this.buildLogoUrl(this.trainingDetails.logoPath1),
          this.buildLogoUrl(this.trainingDetails.logoPath2),
          this.buildLogoUrl(this.trainingDetails.logoPath3),
        ];
      },
      error: (error) => {
        this.isSpinner = false;
      },
    });
  }

  setTrainingInstitute(): void {
    if (this.trainingDetails && this.instituteNames) {
      const selectedInstitute = this.instituteNames.find(
        (institute: any) =>
          institute.id === this.trainingDetails.trainingInstituteId,
      );

      if (selectedInstitute) {
        this.trainingForm.patchValue({
          trainingInstituteName: selectedInstitute,
        });
        this.selectedTrainingInstituteName =
          selectedInstitute.trainingInstituteName;
        this.selectedTrainingInstituteId = selectedInstitute.id;
      } else {
        // If institute not found in list, create a temporary object
        const tempInstitute = {
          id: this.trainingDetails.trainingInstituteId,
          trainingInstituteName: this.trainingDetails.trainingInstituteName,
        };
        this.trainingForm.patchValue({
          trainingInstituteName: tempInstitute,
        });
        this.selectedTrainingInstituteName =
          tempInstitute.trainingInstituteName;
        this.selectedTrainingInstituteId = tempInstitute.id;
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
          return;
        }

        if (
          Array.isArray(this.instituteNames) &&
          this.instituteNames.length === 1
        ) {
          const defaultInstitute = this.instituteNames[0];
          this.trainingForm.patchValue({
            trainingInstituteName: defaultInstitute,
          });
          this.selectedTrainingInstituteName =
            defaultInstitute.trainingInstituteName;
          this.selectedTrainingInstituteId = defaultInstitute.id;
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
    if (!file || !file.type.startsWith('image/')) {
      this.toastr.error('Please select a valid image file', 'File Error');
      return;
    }
    this.cropperTargetType = type;
    this.cropperTargetIndex = index;
    this.cropperOriginalFileName = file.name || `${type}-${index + 1}.png`;
    this.cropperInputFile = file;
    this.showImageCropper = true;
  }

  removeSignature(index: number) {
    if (this.populate === 'true') {
      this.signaturesNew[index].file = null;
    } else {
      this.signatures[index].file = null;
    }
    if (
      typeof this.mySelectedFile[index] === 'string' &&
      this.mySelectedFile[index].startsWith('blob:')
    ) {
      URL.revokeObjectURL(this.mySelectedFile[index]);
    }
    this.mySelectedFile[index] = '';
  }

  removeLogo(index: number) {
    if (this.populate === 'true') {
      this.logosNew[index].file = null;
    } else {
      this.logos[index].file = null;
    }
    if (
      typeof this.mySelectedLogo[index] === 'string' &&
      this.mySelectedLogo[index].startsWith('blob:')
    ) {
      URL.revokeObjectURL(this.mySelectedLogo[index]);
    }
    this.mySelectedLogo[index] = '';
  }

  cancelImageCrop() {
    this.showImageCropper = false;
    this.cropperInputFile = null;
  }

  onCropperLoadFailed() {
    this.toastr.error('Please select a valid image file', 'File Error');
    this.cancelImageCrop();
  }

  onImageCropApplied(event: CroppedImageResult) {
    if (!event.blob) {
      this.toastr.error('Unable to crop selected image', 'Image Error');
      return;
    }

    const mimeType = event.mimeType || 'image/png';
    const croppedFile = new File(
      [event.blob],
      this.createCroppedFileName(this.cropperOriginalFileName, mimeType),
      { type: mimeType },
    );

    if (this.populate === 'true') {
      if (this.cropperTargetType === 'signature') {
        this.signaturesNew[this.cropperTargetIndex].file = croppedFile;
        this.signatureValidationError = '';
      } else {
        this.logosNew[this.cropperTargetIndex].file = croppedFile;
        this.logoValidationError = '';
      }
    } else if (this.cropperTargetType === 'signature') {
      this.signatures[this.cropperTargetIndex].file = croppedFile;
      this.signatureValidationError = '';
    } else {
      this.logos[this.cropperTargetIndex].file = croppedFile;
      this.logoValidationError = '';
    }

    if (this.cropperTargetType === 'signature') {
      this.setCroppedPreview(
        this.mySelectedFile,
        this.cropperTargetIndex,
        event.previewUrl,
      );
    } else {
      this.setCroppedPreview(
        this.mySelectedLogo,
        this.cropperTargetIndex,
        event.previewUrl,
      );
    }

    this.showImageCropper = false;
    this.cropperInputFile = null;
  }

  private setCroppedPreview(target: any[], index: number, previewUrl: string) {
    const existing = target[index];
    if (typeof existing === 'string' && existing.startsWith('blob:')) {
      URL.revokeObjectURL(existing);
    }
    target[index] = previewUrl;
  }

  private createCroppedFileName(originalFileName: string, mimeType: string) {
    const baseName =
      originalFileName.replace(/\.[^/.]+$/, '') || 'certificate-image';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      return `${baseName}-cropped.jpg`;
    }
    if (mimeType.includes('webp')) {
      return `${baseName}-cropped.webp`;
    }
    return `${baseName}-cropped.png`;
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
        console.log('API Response:', response);
        this.trainers =
          response.data.map((trainer: any) => ({
            id: trainer.id,
            name: trainer.trainerName,
          })) || [];
        console.log('Assigned Trainers:', this.trainers);
        this.isLoadingTrainers = false;
      },
      error: (error) => {
        console.error('Error loading trainers:', error);
        this.toastr.error('Failed to load trainers');
        this.isLoadingTrainers = false;
      },
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
      'trainingInstituteName',
    )?.value;
    if (!selectedInstitute) {
      this.selectedTrainingInstituteName = null;
      this.selectedTrainingInstituteId = null;
      return;
    }
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

    if (!this.trainingScheduleFile && !this.existingTrainingSchedulePath) {
      this.showScheduleError = true;
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

    // Include endDate in payload for API to store end date
    if (data.hasOwnProperty('endDate')) {
      data['endDate'] = data['endDate'];
    }

    if (this.selectedTrainers.length > 0) {
      data['trainerId'] = this.selectedTrainers.map((t) => t.id).join(',');
      data['trainerName'] = this.selectedTrainers.map((t) => t.name).join(', ');
    } else {
      data['trainerId'] = null;
      data['trainerName'] = null;
    }
    delete data['guestTrainerName'];
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

      console.log('Logos to upload:', this.logosNew);
      this.logosNew.forEach((item, index) => {
        if (item && item.file) {
          payload.append(`logos${index + 1}`, item.file); // logos1, logos2, logos3
        } else {
          payload.append(`logos${index + 1}`, ''); // empty string if no file
        }
      });

      if (this.trainingScheduleFile) {
        payload.append('trainingSchedule', this.trainingScheduleFile);
      }

      this.isSpinner = true;
      this.trainingService.updateTraining(payload).subscribe({
        next: (response) => {
          this.toastr.success(
            'Training Details Updated Successfully!',
            'Success',
          );
          const trainingId = response.data.id;
          this.router.navigate(['/admin/approvedrejectedTrainings'], {
            queryParams: { trainingId: trainingId },
          });
          this.isSpinner = false;
        },
        error: (error) => {
          this.isSpinner = false;
          // this.toastr.error('Failed to update training', 'Error');
          this.toastr.error(error.error.data);
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

      const logos: (File | null)[] = [0, 1, 2].map((i) =>
        this.logos[i] && this.logos[i].file ? this.logos[i].file : null,
      );

      const [logoLeft, logoCenter, logoRight] = logos;

      payload.append('logoLeft', logoLeft instanceof File ? logoLeft : '');
      payload.append(
        'logoCenter',
        logoCenter instanceof File ? logoCenter : '',
      );
      payload.append('logoRight', logoRight instanceof File ? logoRight : '');
      payload.append('logos', '');

      payload.append('data', JSON.stringify(data));

      this.logFormData(payload, 'Outgoing payload');

      this.signatures.forEach((item) => {
        if (item.file) {
          payload.append('signatures', item.file);
        }
      });

      if (this.trainingScheduleFile) {
        payload.append('trainingSchedule', this.trainingScheduleFile);
      }

      this.isSpinner = true;
      this.trainingService.saveTraining(payload).subscribe({
        next: (response) => {
          this.toastr.success(
            'Training Details Saved Successfully!',
            'Success',
          );
          const trainingId = response.data.id;
          this.router.navigate(['/admin/approvedrejectedTrainings'], {
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

  logFormData(fd: FormData, title = 'FormData payload') {
    console.group(title);
    for (const [key, value] of fd.entries()) {
      if (value instanceof File) {
        console.log(
          `${key}: [File] name="${value.name}", type="${value.type}", size=${value.size}B`,
        );
      } else {
        console.log(`${key}: "${value}"`);
      }
    }
    console.groupEnd();
  }

  openPreview() {
    if (this.trainingForm.invalid) {
      this.trainingForm.markAllAsTouched();
      this.toastr.error(
        'Please fill all required fields before previewing',
        'Error',
      );
      return;
    }

    if (!this.validateSignatureUpload()) {
      return;
    }

    if (!this.validateSignatureFields()) {
      return;
    }

    if (!this.validateLogoUpload()) {
      return;
    }

    const formValue = this.trainingForm.value;

    const ranges = this.dateRanges.controls
      .map((ctrl) => {
        const start = ctrl.get('startDate')?.value;
        const end = ctrl.get('endDate')?.value;
        return { start, end };
      })
      .filter((r) => r.start && r.end);

    let startDate: string | null = null;
    let endDate: string | null = null;

    if (ranges.length > 0) {
      const sorted = [...ranges].sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );
      startDate = sorted[0].start;
      endDate = sorted[sorted.length - 1].end;
    }

    const instituteControl = this.trainingForm.get(
      'trainingInstituteName',
    )?.value;
    const trainingInstituteName =
      instituteControl?.trainingInstituteName ||
      this.selectedTrainingInstituteName ||
      '';

    const signaturesSource =
      this.populate === 'true' ? this.signaturesNew : this.signatures;

    this.cleanupPreviewBlobUrls();

    const signatures = signaturesSource
      .filter(
        (sig) =>
          (sig.file || sig.signatorySignaturePath) &&
          sig.name &&
          sig.designation &&
          sig.organization,
      )
      .slice(0, 2)
      .map((sig) => {
        let path = sig.signatorySignaturePath;
        if (sig.file) {
          const blob = URL.createObjectURL(sig.file);
          this.previewBlobUrls.push(blob);
          path = blob;
        }
        return {
          signatoryName: sig.name,
          signatoryDesignation: sig.designation,
          signatoryOrganization: sig.organization,
          signatorySignaturePath: path,
        };
      });

    const logosSource = this.populate === 'true' ? this.logosNew : this.logos;
    const logoPaths: (string | null)[] = [null, null, null];

    for (let i = 0; i < 3; i++) {
      const item = logosSource[i];
      if (item && item.file) {
        const blob = URL.createObjectURL(item.file);
        this.previewBlobUrls.push(blob);
        logoPaths[i] = blob;
      } else if (this.populate === 'true') {
        logoPaths[i] = this.mySelectedLogo[i] || null;
      }
    }

    const previewPayload: any = {
      name: 'Trainee Name',
      trainingTitle: formValue.trainingTitle,
      duration: formValue.duration,
      durationType: formValue.durationType,
      startDate: startDate,
      endDate: endDate,
      trainingInstituteName,
      logoPath1: logoPaths[0],
      logoPath2: logoPaths[1],
      logoPath3: logoPaths[2],
      signatures,
      createDate: new Date(),
    };

    this.previewData = previewPayload;
    this.showPreview = true;
  }

  closePreview() {
    this.showPreview = false;
    this.previewData = null;
    this.cleanupPreviewBlobUrls();
  }

  private cleanupPreviewBlobUrls() {
    if (this.previewBlobUrls && this.previewBlobUrls.length) {
      this.previewBlobUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
      this.previewBlobUrls = [];
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

  onTrainingScheduleSelect(file: File) {
    if (file) {
      this.trainingScheduleFile = file;
      this.existingTrainingSchedulePath = '';
      this.setTrainingSchedulePreviewUrl(
        window.URL.createObjectURL(file),
        file.name,
      );
      this.showScheduleError = false;
    }
  }

  onTrainingScheduleRemove() {
    this.trainingScheduleFile = null;
    this.existingTrainingSchedulePath = '';
    this.revokeTrainingSchedulePreviewUrl();
    this.trainingScheduleDownloadName = '';
  }

  openTrainingSchedulePreview() {
    if (!this.trainingSchedulePreviewUrl) return;
    window.open(this.trainingSchedulePreviewUrl, '_blank', 'noopener,noreferrer');
  }

  downloadTrainingSchedule() {
    if (this.trainingSchedulePreviewUrl) {
      this.triggerScheduleDownload(
        this.trainingSchedulePreviewUrl,
        this.trainingScheduleDownloadName || 'training-schedule',
      );
      return;
    }

    if (!this.existingTrainingSchedulePath) return;
    this.adminService
      .downloadInstituteImage(this.existingTrainingSchedulePath)
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const name = this.getTrainingScheduleFileName(
            this.existingTrainingSchedulePath,
          );
          this.triggerScheduleDownload(url, name);
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.toastr.error('Failed to download training schedule', 'Error');
        },
      });
  }

  private prepareTrainingSchedulePreview() {
    if (!this.existingTrainingSchedulePath) return;
    this.adminService
      .downloadInstituteImage(this.existingTrainingSchedulePath)
      .subscribe({
        next: (blob: Blob) => {
          this.setTrainingSchedulePreviewUrl(
            window.URL.createObjectURL(blob),
            this.getTrainingScheduleFileName(this.existingTrainingSchedulePath),
          );
        },
        error: () => {
          this.revokeTrainingSchedulePreviewUrl();
          this.trainingScheduleDownloadName = '';
        },
      });
  }

  private setTrainingSchedulePreviewUrl(url: string, name: string) {
    this.revokeTrainingSchedulePreviewUrl();
    this.trainingSchedulePreviewUrl = url;
    this.trainingScheduleDownloadName = name || 'training-schedule';
  }

  private revokeTrainingSchedulePreviewUrl() {
    if (
      this.trainingSchedulePreviewUrl &&
      this.trainingSchedulePreviewUrl.startsWith('blob:')
    ) {
      window.URL.revokeObjectURL(this.trainingSchedulePreviewUrl);
    }
    this.trainingSchedulePreviewUrl = '';
  }

  private getTrainingScheduleFileName(path: string): string {
    const raw = (path || '').toString().trim();
    if (!raw) return 'training-schedule';
    return raw.split(/[/\\]/).pop() || 'training-schedule';
  }

  private triggerScheduleDownload(url: string, fileName: string) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
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
      const instituteHeadSignature =
        this.signaturesNew[0]?.file ||
        this.signaturesNew[0]?.signatorySignaturePath;
      if (!instituteHeadSignature) {
        this.signatureValidationError =
          "Institute Head's signature is required";
        return false;
      }
    } else {
      const instituteHeadSignature = this.signatures[0]?.file;
      if (!instituteHeadSignature) {
        this.signatureValidationError =
          "Institute Head's signature is required";
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
      const centerHasLogo =
        (this.logosNew[1] && this.logosNew[1].file) || !!this.mySelectedLogo[1];

      if (!centerHasLogo) {
        this.logoValidationError = 'Center logo is required';
        return false;
      }
    } else {
      const centerHasLogo = this.logos[1] && this.logos[1].file;
      if (!centerHasLogo) {
        this.logoValidationError = 'Center logo is required';
        return false;
      }
    }

    return true;
  }

  get dateRanges(): FormArray {
    return this.trainingForm.get('dateRanges') as FormArray;
  }

  private createDateRangeGroup(
    startDate?: string,
    endDate?: string,
  ): FormGroup {
    return this.fb.group(
      {
        startDate: [
          startDate || '',
          [Validators.required, this.futureDateValidator.bind(this)],
        ],
        endDate: [endDate || '', Validators.required],
      },
      { validators: [this.endDateAfterStartValidator.bind(this)] },
    );
  }

  // Validator to ensure no date ranges overlap (including the top-level range)
  private noOverlapValidator(group: AbstractControl): ValidationErrors | null {
    const form = group as FormGroup;
    if (!form) return null;

    const ranges: Array<{
      start: number;
      end: number;
      startCtrl: AbstractControl | null;
      endCtrl: AbstractControl | null;
    }> = [];

    const arr = form.get('dateRanges') as FormArray;
    if (arr && Array.isArray(arr.controls)) {
      arr.controls.forEach((ctrl: AbstractControl) => {
        const sCtrl = ctrl.get('startDate');
        const eCtrl = ctrl.get('endDate');
        const s = sCtrl?.value ? new Date(sCtrl.value).getTime() : NaN;
        const e = eCtrl?.value ? new Date(eCtrl.value).getTime() : NaN;
        if (!isNaN(s) && !isNaN(e)) {
          ranges.push({ start: s, end: e, startCtrl: sCtrl, endCtrl: eCtrl });
        }
      });
    }

    if (arr && Array.isArray(arr.controls)) {
      arr.controls.forEach((ctrl: AbstractControl) => {
        this.clearControlError(ctrl.get('startDate'), 'rangeOverlap');
        this.clearControlError(ctrl.get('endDate'), 'rangeOverlap');
      });
    }

    // Compute pairwise overlaps (inclusive)
    let hasOverlap = false;
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i];
        const b = ranges[j];
        const overlaps = a.start <= b.end && b.start <= a.end; // inclusive
        if (overlaps) {
          hasOverlap = true;
          this.setControlError(a.startCtrl, 'rangeOverlap');
          this.setControlError(a.endCtrl, 'rangeOverlap');
          this.setControlError(b.startCtrl, 'rangeOverlap');
          this.setControlError(b.endCtrl, 'rangeOverlap');
        }
      }
    }

    return hasOverlap ? { rangesOverlap: true } : null;
  }

  private setControlError(control: AbstractControl | null, key: string): void {
    if (!control) return;
    const current = control.errors || {};
    if (!current[key]) {
      control.setErrors({ ...current, [key]: true });
    }
  }

  private clearControlError(
    control: AbstractControl | null,
    key: string,
  ): void {
    if (!control || !control.errors) return;
    const { [key]: removed, ...rest } = control.errors;
    control.setErrors(Object.keys(rest).length ? rest : null);
  }

  addDateRange(startDate?: string, endDate?: string): void {
    this.dateRanges.push(this.createDateRangeGroup(startDate, endDate));
  }

  removeDateRange(index: number): void {
    if (index > -1 && index < this.dateRanges.length) {
      this.dateRanges.removeAt(index);
    }
  }
}
