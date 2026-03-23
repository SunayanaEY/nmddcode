import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
  catchError,
} from 'rxjs/operators';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import {
  LocationService,
  State,
  District,
} from '../../../services/location.service';
import { AuthService } from '../../../services/auth.service';
import { AdminService } from '../services/training-admin.service';
import * as pdfjsLib from 'pdfjs-dist';
import { TranslateModule } from '@ngx-translate/core';
import {
  CroppedImageResult,
  ImageCropperModalComponent,
} from '../../../components/image-cropper-modal/image-cropper-modal.component';

@Component({
  selector: 'app-training-centre-admin-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // BreadcrumbComponent,
    TranslateModule,
    ImageCropperModalComponent,
  ],
  templateUrl: './training-centre-admin-profile.component.html',
  styleUrls: ['./training-centre-admin-profile.component.css'],
})
export class TrainingCentreAdminProfileComponent implements OnInit, OnDestroy {
  @Output() formSubmitted = new EventEmitter<void>();
  @ViewChild('docFileInput') docFileInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('imageFileInput') imageFileInputRef?: ElementRef<HTMLInputElement>;

  profileForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileDoc: File | null = null;
  selectedImagePreview: string | null = null;
  selectedDocPreview: string | null = null;
  pdfPreviewUrl: string | null = null;
  isDragOver = false;
  isDragOverDoc = false;
  showPassword = false;
  showConfirmPassword = false;
  usernameCheckSubscription: Subscription | null = null;
  isCheckingUsername = false;
  isUsernameAvailable = false;
  initialUsername = '';

  // Password validation properties
  hasMinLength = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;
  isLoading = false;
  userRole: any;
  instituteData: any;
  trainingInstituteId: any;
  userId: any;
  today: string | undefined;
  organizations: any[] = [];
  instituteImageUrl: string | null = null;
  showImageCropper = false;
  cropperInputFile: File | null = null;
  cropperOriginalFileName = 'institute-image.jpg';

  // Location data
  states: State[] = [];
  districts: District[] = [];
  isLoadingStates = false;
  isLoadingDistricts = false;

  // Institute Type options
  instituteTypes = [
    { value: 'Government Owned', label: 'Government Owned' },
    { value: 'Other Organizations', label: 'Other Organizations' },
  ];

  instituteGrades: string[] = ['A', 'B', 'A+'];

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Institute Registration' },
  ];

  // Custom validator for password matching
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private locationService: LocationService,
    private authService: AuthService,
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {
    // Configure PDF.js worker to use bundled version
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.js';

    this.getRole();
    if (this.userRole == 5 || this.userRole == 6) {
      const nav = this.router.getCurrentNavigation();
      const passedData = nav?.extras.state?.['data'];
      this.trainingInstituteId = passedData.id;
      this.instituteData = passedData;
    }
    if (this.userRole == 1) {
      this.profileForm = this.fb.group({
        trainingInstituteName: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.pattern('^[a-zA-Z ]*$'),
          ],
        ],
        instituteType: ['', [Validators.required]],
        organization: [''],
        instituteGrade: ['', [Validators.required]],
        trainingInstituteRegistration: [
          { value: '', disabled: true },
          [],
        ],
        trainingInstituteExpiry: ['', []],
        state: ['', [Validators.required]],
        district: ['', [Validators.required]],
        address: ['', [Validators.required, Validators.minLength(10)]],
        latitude: [
          '',
          [Validators.required, Validators.min(-90), Validators.max(90)],
        ],
        longitude: [
          '',
          [Validators.required, Validators.min(-180), Validators.max(180)],
        ],
      });

      // Subscribe to state changes to load districts
      this.profileForm.get('state')?.valueChanges.subscribe((stateId) => {
        if (stateId) {
          this.loadDistricts(stateId);
          this.profileForm.get('district')?.setValue('');
        } else {
          this.districts = [];
          this.profileForm.get('district')?.setValue('');
        }
      });

      // Subscribe to institute type changes to handle organization validation
      this.profileForm.get('instituteType')?.valueChanges.subscribe((type) => {
        const orgControl = this.profileForm.get('organization');

        if (type === 'Other Organizations') {
          // Organization required
          this.loadOrganizations();
          orgControl?.setValidators([Validators.required]);
        } else {
          // Organization not required
          orgControl?.clearValidators();
          orgControl?.setValue('');
        }

        orgControl?.updateValueAndValidity();
      });
    } else {
      this.profileForm = this.fb.group(
        {
          trainingInstituteName: [
            '',
            [
              Validators.required,
              Validators.minLength(3),
              Validators.pattern('^[a-zA-Z ]*$'),
            ],
          ],
          instituteType: ['', [Validators.required]],
          organization: [''],
          instituteGrade: ['', [Validators.required]],
          trainingInstituteRegistration: [
            { value: '', disabled: true },
            [],
          ],
          trainingInstituteExpiry: ['', []],
          state: ['', [Validators.required]],
          district: ['', [Validators.required]],
          address: ['', [Validators.required, Validators.minLength(10)]],
          latitude: [
            '',
            [Validators.required, Validators.min(-90), Validators.max(90)],
          ],
          longitude: [
            '',
            [Validators.required, Validators.min(-180), Validators.max(180)],
          ],
          contactPersonName: [
            '',
            [Validators.required, Validators.minLength(2)],
          ],
          username: [
            '',
            this.userRole === 5
              ? [
                  Validators.required,
                  Validators.minLength(3),
                  Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
                ]
              : [],
          ],
          designation: ['', [Validators.required]],
          contactNumber: [
            '',
            [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
          ],
          emailId: ['', [Validators.required, Validators.email]],
          password: [
            '',
            [
              Validators.required,
              Validators.minLength(8),
              Validators.pattern(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
              ),
            ],
          ],
          confirmPassword: ['', [Validators.required]],
        },
        { validators: this.passwordMatchValidator.bind(this) }
      );
    }
  }

  ngOnInit() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.loadStates();
    if (this.userRole == 5 || this.userRole == 6) {
      this.initializeForm();
      // Subscribe to password field changes for real-time validation
      this.profileForm.get('password')?.valueChanges.subscribe((password) => {
        this.validatePassword(password || '');
      });
    }
    if (this.userRole == 5) {
      this.setupUsernameAvailabilityCheck();
    }
  }
  onInstituteTypeChange(event:any){
    this.loadOrganizations();
  }

  getRole() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role;
      this.userId = user.id;
    }
  }

  /**
   * Load organizations from API
   */
  loadOrganizations() {
    this.isLoadingStates = true;
    this.adminService.getAllOrganization().subscribe({
      next: (organizations: any) => {
        this.organizations = organizations;
        this.isLoadingStates = false;
      },
      error: (error: any) => {
        console.error('Error loading organizations:', error);
        this.toastr.error('Failed to load organizations', 'Error');
        this.isLoadingStates = false;
      },
    });
  }

  /**
   * Load states from API
   */
  loadStates() {
    this.isLoadingStates = true;
    this.locationService.getStates().subscribe({
      next: (states: State[]) => {
        this.states = states;
        this.isLoadingStates = false;
      },
      error: (error: any) => {
        console.error('Error loading states:', error);
        this.toastr.error('Failed to load states', 'Error');
        this.isLoadingStates = false;
      },
    });
  }

  /**
   * Load districts based on selected state
   */
  loadDistricts(stateId: number) {
    this.isLoadingDistricts = true;
    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts: District[]) => {
        this.districts = districts;
        this.isLoadingDistricts = false;
      },
      error: (error: any) => {
        console.error('Error loading districts:', error);
        this.toastr.error('Failed to load districts', 'Error');
        this.isLoadingDistricts = false;
      },
    });
  }

  /**
   * Handle state selection change
   */
  onStateChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const stateId = parseInt(target.value);

    if (stateId) {
      this.loadDistricts(stateId);
      this.profileForm.get('district')?.setValue('');
    } else {
      this.districts = [];
      this.profileForm.get('district')?.setValue('');
    }
  }

  private getSelectedOrganizationTypeCode(): string {
    const selectedOrgId = this.profileForm.get('organization')?.value;
    if (!selectedOrgId) {
      return '';
    }
    const selectedOrg = this.organizations.find(
      (org) => String(org.id) === String(selectedOrgId)
    );
    return selectedOrg?.organizationType || '';
  }

  initializeForm() {
    this.profileForm.patchValue({
      trainingInstituteName: this.instituteData.trainingInstituteName,
      trainingInstituteRegistration: this.instituteData.registrationId,
      trainingInstituteExpiry: this.instituteData.expiryDate
        ? this.instituteData.expiryDate.split('T')[0]
        : '',
      instituteType: this.instituteData.instituteType,
      instituteGrade: this.instituteData.instituteGrade,
      state: this.instituteData.stateId,
      address: this.instituteData.address,
      latitude: this.instituteData.latitude,
      longitude: this.instituteData.longitude,
    });

    this.loadDistricts(this.instituteData.stateId);
    this.profileForm.patchValue({
      district: this.instituteData.districtId,
    });

    // Load organizations if user role is 6 or 5 (or if needed)
    if ((this.userRole == 6 || this.userRole == 5) && this.instituteData.organizationId) {
      this.loadOrganizations();
      this.profileForm.patchValue({
        organization: this.instituteData.organizationId,
      });
    }

    // Disable controls
    this.profileForm.get('trainingInstituteName')?.disable();
    this.profileForm.get('trainingInstituteRegistration')?.disable();
    this.profileForm.get('trainingInstituteExpiry')?.disable();
    this.profileForm.get('instituteType')?.disable();
    this.profileForm.get('instituteGrade')?.disable();
    this.profileForm.get('state')?.disable();
    this.profileForm.get('address')?.disable();
    this.profileForm.get('latitude')?.disable();
    this.profileForm.get('longitude')?.disable();
    this.profileForm.get('district')?.disable();
    this.profileForm.get('organization')?.disable();

    if (this.instituteData.contactPersonName != null) {
      this.profileForm.patchValue({
        contactPersonName: this.instituteData.contactPersonName,
      });
    }
    if (this.instituteData.username != null) {
      this.initialUsername = this.instituteData.username;
      this.profileForm.patchValue({
        username: this.instituteData.username,
      });
    }
    if (this.instituteData.designation != null) {
      this.profileForm.patchValue({
        designation: this.instituteData.designation,
      });
    }
    if (this.instituteData.contactNumber != null) {
      this.profileForm.patchValue({
        contactNumber: this.instituteData.contactNumber,
      });
    }
    if (this.instituteData.emailId != null) {
      this.profileForm.patchValue({
        emailId: this.instituteData.emailId,
      });
    }

    // Load institute image if available
    if (this.instituteData.instituteImageUrl) {
      this.adminService
        .downloadInstituteImage(this.instituteData.instituteImageUrl)
        .subscribe({
          next: (blob: Blob) => {
            this.instituteImageUrl = URL.createObjectURL(blob);
          },
          error: (error: any) => {
            console.error('Error loading institute image:', error);
          },
        });
    }
  }

  allowOnlyAlphabetsAndDigits(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    if (
      !(charCode >= 65 && charCode <= 90) && // A-Z
      !(charCode >= 97 && charCode <= 122) && // a-z
      !(charCode >= 48 && charCode <= 57) // 0-9
    ) {
      event.preventDefault();
    }
  }

  allowOnlyAlphabets(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    if (
      !(charCode >= 65 && charCode <= 90) && // A-Z
      !(charCode >= 97 && charCode <= 122) && // a-z
      charCode !== 32 // space
    ) {
      event.preventDefault();
    }
  }

  /**
   * Block manual input for date fields to enforce calendar selection
   */
  blockManualInput(event: KeyboardEvent) {
    // Allow tab for navigation
    if (event.key === 'Tab') {
      return;
    }
    // Prevent all other keys
    event.preventDefault();
  }

  /**
   * Handle form submission
   */
  onSubmit() {
    if (this.userRole == 5 && this.isCheckingUsername) {
      this.toastr.info('Please wait while username availability is checked');
      return;
    }
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.toastr.error(
        'Please fill in all required fields correctly',
        'Validation Error'
      );
      return;
    }
    const formData = new FormData();

    if (this.userRole == 1) {
      if (!this.selectedFile) {
        this.toastr.error(
          'Please select an institute image',
          'Validation Error'
        );
        return;
      }
      if (!this.selectedFileDoc) {
        this.toastr.error(
          'Please select a security document',
          'Validation Error'
        );
        return;
      }
      this.isLoading = true;

      // Create instituteDetails object matching the API structure
      const expiryValue = this.profileForm.get(
        'trainingInstituteExpiry'
      )?.value;

      let instituteDetails = {};
      
      if (
        this.profileForm.get('instituteType')?.value === 'Other Organizations'
      ) {
        const organizationTypeCode = this.getSelectedOrganizationTypeCode();

        instituteDetails = {
          instituteName:
            this.profileForm.get('trainingInstituteName')?.value || '',
          // registrationNumber:
          //   this.profileForm.get('trainingInstituteRegistration')?.value || '',
          registrationValidity: expiryValue ? expiryValue + 'T00:00:00' : '',
          instituteType: this.profileForm.get('instituteType')?.value || '',
          instituteGrade: this.profileForm.get('instituteGrade')?.value || '',
          instituteOwnedBy: organizationTypeCode,
          organizationId: this.profileForm.get('organization')?.value || '',
          stateId: parseInt(this.profileForm.get('state')?.value) || 0,
          districtId: parseInt(this.profileForm.get('district')?.value) || 0,
          address: this.profileForm.get('address')?.value || '',
          latitude: this.profileForm.get('latitude')?.value || null,
          longitude: this.profileForm.get('longitude')?.value || null,
        };
      } else {
        instituteDetails = {
          instituteName:
            this.profileForm.get('trainingInstituteName')?.value || '',
          // registrationNumber:
          //   this.profileForm.get('trainingInstituteRegistration')?.value || '',
          registrationValidity: expiryValue ? expiryValue + 'T00:00:00' : '',
          instituteType: this.profileForm.get('instituteType')?.value || '',
          instituteGrade: this.profileForm.get('instituteGrade')?.value || '',
          stateId: parseInt(this.profileForm.get('state')?.value) || 0,
          districtId: parseInt(this.profileForm.get('district')?.value) || 0,
          address: this.profileForm.get('address')?.value || '',
          latitude: this.profileForm.get('latitude')?.value || null,
          longitude: this.profileForm.get('longitude')?.value || null,
        };
      }

      // Append instituteDetails as JSON string with explicit content type
      const instituteDetailsString = JSON.stringify(instituteDetails);
      console.log(
        `[TrainingInstitute/Create] endpoint: trainingInstitutes/create/${this.userId}`
      );
      console.log('[TrainingInstitute/Create] payload string:', instituteDetailsString);
      const instituteDetailsBlob = new Blob([instituteDetailsString], {
        type: 'application/json',
      });
      formData.append('data', instituteDetailsBlob);

      // Append image file
      formData.append('registrationDoc', this.selectedFileDoc);
      formData.append('instituteImage', this.selectedFile);
      this.authService.createInstitute(this.userId, formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            const registrationId = response.data?.registrationId || 'N/A';
            const instituteName = response.data?.trainingInstituteName || 'N/A';
            const status = response.data?.status || 'PENDING';

            this.profileForm.reset();
            this.selectedFile = null;
            this.selectedImagePreview = null;
            this.resetUsernameAvailabilityState();

            this.toastr.success(
              `Training Centre Admin profile created successfully! Registration ID: ${registrationId}`,
              'Success'
            );

            this.formSubmitted.emit();
          } else {
            this.toastr.error(
              response.message || 'Registration failed',
              'Error'
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage =
            error.error?.message || 'Registration failed. Please try again.';
          this.toastr.error(errorMessage, 'Error');
          console.error('Registration error:', error);
        },
      });
    } else {
      this.isLoading = true;

      const instituteDetails = {
        contactPersonName:
          this.profileForm.get('contactPersonName')?.value || '',
        username:
          this.userRole === 5
            ? this.profileForm.get('username')?.value || ''
            : undefined,
        designation: this.profileForm.get('designation')?.value || '',
        contactNumber: this.profileForm.get('contactNumber')?.value || '',
        emailId: this.profileForm.get('emailId')?.value || '',
        password: this.profileForm.get('password')?.value || '',
      };

      this.authService
        .updateInstitute(this.trainingInstituteId, instituteDetails)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              const registrationId = response.data?.registrationId || 'N/A';
              const instituteName =
                response.data?.trainingInstituteName || 'N/A';
              const status = response.data?.status || 'PENDING';

              this.profileForm.reset();
              this.selectedFile = null;
              this.selectedImagePreview = null;

              this.toastr.success(
                `Training Centre Admin profile updated successfully! Registration ID: ${registrationId}`,
                'Success'
              );

              this.formSubmitted.emit();
              this.router.navigate(['/admin/training-centre']);
            } else {
              this.toastr.error(response.message || 'Updation failed', 'Error');
            }
          },
          error: (error) => {
            this.isLoading = false;
            const errorMessage =
              error.error?.message || 'Registration failed. Please try again.';
            this.toastr.error(errorMessage, 'Error');
            console.error('Registration error:', error);
          },
        });
    }
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processImageFile(input.files[0]);
    }
  }

  onFileSelectedDoc(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'File Error');
        return;
      }

      if (!file.type.startsWith('application/pdf')) {
        this.toastr.error('Please select a valid PDF file', 'File Error');
        return;
      }

      this.selectedFileDoc = file;
      this.selectedDocPreview = file.name;

      this.generatePdfPreview(file);
    }
  }

  async generatePdfPreview(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);

      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context!,
        viewport: viewport,
        canvas: canvas,
      };

      await page.render(renderContext).promise;
      this.pdfPreviewUrl = canvas.toDataURL();
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      this.toastr.error('Error generating PDF preview', 'Preview Error');
    }
  }

  triggerFileInput() {
    this.docFileInputRef?.nativeElement?.click();
  }

  triggerFileInputImage() {
    this.imageFileInputRef?.nativeElement?.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragOverDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOverDoc = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDragLeaveDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOverDoc = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.processImageFile(files[0]);
    }
  }

  onDropDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOverDoc = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];

      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'File Error');
        return;
      }

      if (!file.type.startsWith('application/pdf')) {
        this.toastr.error('Please select a valid document file', 'File Error');
        return;
      }

      this.selectedFileDoc = file;
      this.selectedDocPreview = file.name;

      this.generatePdfPreview(file);
    }
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.selectedImagePreview = null;
    this.showImageCropper = false;
    this.resetCropperState();
    if (this.imageFileInputRef?.nativeElement) {
      this.imageFileInputRef.nativeElement.value = '';
    }
  }

  removeDoc(event: Event) {
    event.stopPropagation();
    this.selectedFileDoc = null;
    this.selectedDocPreview = null;
    this.pdfPreviewUrl = null;
    if (this.docFileInputRef?.nativeElement) {
      this.docFileInputRef.nativeElement.value = '';
    }
  }

  processImageFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('File size must be less than 5MB', 'File Error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please select a valid image file', 'File Error');
      return;
    }

    this.cropperOriginalFileName = file.name || 'institute-image.jpg';
    this.cropperInputFile = file;
    this.showImageCropper = true;
  }

  cancelImageCrop() {
    this.showImageCropper = false;
    this.resetCropperState();
    if (this.imageFileInputRef?.nativeElement) {
      this.imageFileInputRef.nativeElement.value = '';
    }
  }

  onImageCropApplied(event: CroppedImageResult) {
    if (!event.blob) {
      this.toastr.error('Unable to crop selected image', 'Image Error');
      return;
    }

    const mimeType = event.mimeType || 'image/png';
    this.selectedFile = new File(
      [event.blob],
      this.createCroppedFileName(this.cropperOriginalFileName, mimeType),
      { type: mimeType }
    );
    this.selectedImagePreview = event.previewUrl;
    this.showImageCropper = false;
    this.resetCropperState();
  }

  onCropperLoadFailed() {
    this.toastr.error('Please select a valid image file', 'File Error');
    this.cancelImageCrop();
  }

  private createCroppedFileName(originalFileName: string, mimeType: string) {
    const baseName = originalFileName.replace(/\.[^/.]+$/, '') || 'institute-image';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      return `${baseName}-cropped.jpg`;
    }
    if (mimeType.includes('webp')) {
      return `${baseName}-cropped.webp`;
    }
    return `${baseName}-cropped.png`;
  }

  private resetCropperState() {
    this.cropperInputFile = null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/training-institute-management']);
  }

  validatePassword(password: string) {
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[@$!%*?&]/.test(password);
  }

  private setupUsernameAvailabilityCheck() {
    const usernameControl = this.profileForm.get('username');
    if (!usernameControl) {
      return;
    }

    this.usernameCheckSubscription?.unsubscribe();
    this.usernameCheckSubscription = usernameControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: string) => {
          const username = (value || '').trim();

          if (!username || usernameControl.invalid) {
            this.resetUsernameAvailabilityState();
            return of(null);
          }
          if (
            this.initialUsername &&
            username.toLowerCase() === this.initialUsername.toLowerCase()
          ) {
            this.resetUsernameAvailabilityState();
            return of(null);
          }

          this.isCheckingUsername = true;
          this.isUsernameAvailable = false;
          this.clearUsernameTakenError();

          return this.authService.checkUsername(username).pipe(
            map((response) => ({
              available: this.isUsernameValid(response),
            })),
            catchError(() => of({ available: false }))
          );
        })
      )
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.isCheckingUsername = false;
        if (result.available) {
          this.isUsernameAvailable = true;
          this.clearUsernameTakenError();
          return;
        }

        this.isUsernameAvailable = false;
        usernameControl.setErrors({
          ...(usernameControl.errors || {}),
          usernameTaken: true,
        });
      });
  }

  private isUsernameValid(response: any): boolean {
    if (typeof response === 'boolean') {
      return response;
    }
    if (!response || typeof response !== 'object') {
      return false;
    }
    if (typeof response.valid === 'boolean') {
      return response.valid;
    }
    if (typeof response.available === 'boolean') {
      return response.available;
    }
    if (typeof response.exists === 'boolean') {
      return !response.exists;
    }
    if (typeof response.success === 'boolean') {
      return response.success;
    }

    const responseData = response.data;
    if (responseData && typeof responseData === 'object') {
      if (typeof responseData.valid === 'boolean') {
        return responseData.valid;
      }
      if (typeof responseData.available === 'boolean') {
        return responseData.available;
      }
      if (typeof responseData.exists === 'boolean') {
        return !responseData.exists;
      }
    }

    return false;
  }

  private clearUsernameTakenError() {
    const usernameControl = this.profileForm.get('username');
    if (!usernameControl?.errors) {
      return;
    }

    const { usernameTaken, ...restErrors } = usernameControl.errors;
    if (usernameTaken) {
      usernameControl.setErrors(
        Object.keys(restErrors).length ? restErrors : null
      );
    }
  }

  private resetUsernameAvailabilityState() {
    this.isCheckingUsername = false;
    this.isUsernameAvailable = false;
    this.clearUsernameTakenError();
  }

  ngOnDestroy(): void {
    this.usernameCheckSubscription?.unsubscribe();
  }
}
