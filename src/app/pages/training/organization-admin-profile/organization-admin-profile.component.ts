import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
import { Observable, of } from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';
import { AdminService } from '../services/training-admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-organization-admin-profile',
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent, TranslateModule],
  templateUrl: './organization-admin-profile.component.html',
  styleUrl: './organization-admin-profile.component.css',
})
export class OrganizationAdminProfileComponent implements OnInit {
  @Input() editData: any = null;
  @Output() formSubmissionSuccess = new EventEmitter<void>();
  @Output() formCanceled = new EventEmitter<void>();

  profileForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileDoc: File | null = null;
  selectedImagePreview: string | null = null;
  selectedDocPreview: string | null = null;
  isDragOver = false;
  isDragOverDoc = false;
  showPassword = false;
  showConfirmPassword = false;

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
  error: string | null = null;
  organizationData: any;
  editOrganizationId: string | null = null;
  originalOrganizationCode = '';
  today: string | undefined;

  // Location data
  states: State[] = [];
  districts: District[] = [];
  isLoadingStates = false;
  isLoadingDistricts = false;

  // Institute Type options
  instituteTypes = [
    { value: 'Government', label: 'Government' },
    { value: 'Private', label: 'Private' },
  ];

  organizationTypeOptions: string[] = ['NDDB', 'Co-operative', 'NGO', 'Private'];

  private mapOrganizationTypeToCode(value: string): string {
    switch (value) {
      case 'NDDB':
        return 'NDDB';
      case 'Co-operative':
        return 'COOP';
      case 'NGO':
        return 'NGOS';
      case 'Private':
        return 'PRVT';
      default:
        return value;
    }
  }

  private mapOrganizationTypeFromCode(value: string): string {
    switch ((value || '').toUpperCase()) {
      case 'NDDB':
        return 'NDDB';
      case 'COOP':
      case 'CO-OPERATIVE':
      case 'COOPERATIVE':
      case 'CO-OP':
      case 'CO-OPRATIVE':
      case 'CO-OPERATIVE SOCIETY':
        return 'Co-operative';
      case 'NGOS':
      case 'NGO':
        return 'NGO';
      case 'PRVT':
      case 'PRIVATE':
        return 'Private';
      default:
        return value;
    }
  }

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/admin/training-module' },
    { label: 'Other Organization Registration' },
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

  organizationCodeValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    const code = control.value;

    if (!code) {
      return of(null);
    }

    if (!/^[A-Za-z]{4}$/.test(code)) {
      return of(null);
    }

    if (
      this.editOrganizationId &&
      this.originalOrganizationCode &&
      code.toUpperCase() === this.originalOrganizationCode.toUpperCase()
    ) {
      return of(null);
    }

    return this.authService.checkOrganizationCode(code).pipe(
      map((response) =>
        response.exists ? { orgCodeExists: response.message } : null
      ),
      catchError(() =>
        of({ orgCodeExists: 'Organization code validation failed' })
      )
    );
  }

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    private locationService: LocationService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.getRole();
    // if (this.userRole == 5) {
    //   const nav = this.router.getCurrentNavigation();
    //   const passedData = nav?.extras.state?.['data'];
    //   this.trainingInstituteId = passedData.id;
    //   this.instituteData = passedData;
    // }

    this.profileForm = this.fb.group(
      {
        organizationName: ['', [Validators.required, Validators.minLength(3)]],
        trainingInstituteRegistration: [
          '',
          this.userRole === 6
            ? [Validators.required, Validators.minLength(3)]
            : [],
        ],
        organizationType: ['', [Validators.required]],
        organizationCode: [
          '',
          [Validators.required, Validators.pattern(/^[A-Za-z]{4}$/)],
          [this.organizationCodeValidator.bind(this)],
        ],
        state: ['', [Validators.required]],
        district: ['', [Validators.required]],
        address: ['', [Validators.required, Validators.minLength(10)]],
        contactPersonName: ['', [Validators.required, Validators.minLength(2)]],
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
      { validators: this.passwordMatchValidator }
    );

    // Subscribe to state changes to load districts
    this.profileForm.get('state')?.valueChanges.subscribe((stateId) => {
      if (stateId) {
        this.loadDistricts(stateId);
        // Reset district selection when state changes
        this.profileForm.get('district')?.setValue('');
      } else {
        this.districts = [];
        this.profileForm.get('district')?.setValue('');
      }
    });
    if (this.userRole == 6) {
      this.adminService.getOrganizationDataById(this.userId).subscribe({
        next: (response) => {
          this.organizationData = response;
          this.initializeForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading Other  Organizations:', error);
          this.error = 'Failed to load organization data';
          this.isLoading = false;
        },
      });
    }
  }

  ngOnInit() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.loadStates();

    // Subscribe to password field changes for real-time validation
    this.profileForm.get('password')?.valueChanges.subscribe((password) => {
      this.validatePassword(password || '');
    });

    if (this.editData) {
      this.setEditData(this.editData);
    }
  }
  getRole() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role;
      this.userId = user.OrganizationId;
    }
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
  initializeForm() {
    this.editOrganizationId = this.organizationData.id || this.userId || null;
    this.originalOrganizationCode = this.organizationData.organizationCode || '';
    this.profileForm.patchValue({
      organizationName: this.organizationData.organizationName,
      trainingInstituteRegistration: this.organizationData.registrationNumber,
      organizationType: this.mapOrganizationTypeFromCode(
        this.organizationData.organizationType ||
          this.organizationData.instituteOwnedBy
      ),
      organizationCode: this.organizationData.organizationCode || '',
      state: this.organizationData.stateId,
      address: this.organizationData.address,
      contactPersonName: this.organizationData.contactName,
      designation: this.organizationData.designation,
      contactNumber: this.organizationData.contactNumber,
      emailId: this.organizationData.email,
      password: '',
      confirmPassword: '',
    });
    this.loadDistricts(this.organizationData.stateId);
    this.profileForm.patchValue({
      district: this.organizationData.districtId,
    });
    this.setupPasswordValidationByMode();
  }

  setEditData(data: any): void {
    this.editOrganizationId = data.id || null;
    this.originalOrganizationCode = data.organizationCode || '';

    this.profileForm.patchValue({
      organizationName: data.organizationName || '',
      trainingInstituteRegistration: data.registrationNumber || '',
      organizationType: this.mapOrganizationTypeFromCode(
        data.organizationType || data.instituteOwnedBy
      ),
      organizationCode: data.organizationCode || '',
      state: data.stateId || '',
      district: data.districtId || '',
      address: data.address || '',
      contactPersonName: data.contactName || '',
      designation: data.designation || '',
      contactNumber: data.contactNumber || '',
      emailId: data.email || '',
      password: '',
      confirmPassword: '',
    });

    if (data.stateId) {
      this.loadDistricts(data.stateId);
    }
    this.setupPasswordValidationByMode();
  }

  clearEditMode(): void {
    this.editOrganizationId = null;
    this.originalOrganizationCode = '';
    if (this.userRole == 6 && this.organizationData) {
      this.initializeForm();
      return;
    }
    this.profileForm.reset();
    this.setupPasswordValidationByMode();
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
  }

  private setupPasswordValidationByMode(): void {
    const passwordControl = this.profileForm.get('password');
    const confirmPasswordControl = this.profileForm.get('confirmPassword');

    if (this.isUpdateMode) {
      passwordControl?.setValue('');
      confirmPasswordControl?.setValue('');
      passwordControl?.clearValidators();
      confirmPasswordControl?.clearValidators();
    } else {
      passwordControl?.setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        ),
      ]);
      confirmPasswordControl?.setValidators([Validators.required]);
    }

    passwordControl?.updateValueAndValidity({ emitEvent: false });
    confirmPasswordControl?.updateValueAndValidity({ emitEvent: false });
    this.profileForm.updateValueAndValidity({ emitEvent: false });
  }

  onSubmit() {
    if (this.profileForm.invalid || this.profileForm.pending) {
      this.markFormGroupTouched(this.profileForm);
      this.toastr.error(
        'Please fill in all required fields correctly',
        'Validation Error'
      );
      return;
    }
    const isUpdateMode = this.userRole == 6 || !!this.editOrganizationId;
    const targetOrganizationId = this.editOrganizationId || this.userId;

    if (!isUpdateMode) {
      this.isLoading = true;

      const organizationDetails = {
        organizationName: this.profileForm.get('organizationName')?.value || '',
        registrationNumber: null,
        organizationCode: this.profileForm.get('organizationCode')?.value || '',
        organizationType: this.mapOrganizationTypeToCode(
          this.profileForm.get('organizationType')?.value || ''
        ),
        stateId: parseInt(this.profileForm.get('state')?.value) || 0,
        districtId: parseInt(this.profileForm.get('district')?.value) || 0,
        address: this.profileForm.get('address')?.value || '',
        contactName: this.profileForm.get('contactPersonName')?.value || '',
        designation: this.profileForm.get('designation')?.value || '',
        contactNumber: this.profileForm.get('contactNumber')?.value || '',
        email: this.profileForm.get('emailId')?.value || '',
        password: this.profileForm.get('password')?.value || '',

        // latitude: this.profileForm.get('latitude')?.value || null,
        // longitude: this.profileForm.get('longitude')?.value || null,
      };

      this.authService.createOrganization(organizationDetails).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            // Show success message with registration details
            const registrationId = response.data?.registrationNumber || 'N/A';
            const instituteName = response.data?.organizationName || 'N/A';

            // Reset form after successful registration
            this.profileForm.reset();
            this.toastr.success(
              `Organization Admin profile created successfully`,
              'Success'
            );
            if (this.formSubmissionSuccess.observers.length > 0) {
              this.formSubmissionSuccess.emit();
            } else {
              this.router.navigate(['/admin/organization-table']);
            }
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

      const organizationDetails = {
        organizationName: this.profileForm.get('organizationName')?.value || '',
        registrationNumber:
          this.profileForm.get('trainingInstituteRegistration')?.value || '',
        organizationType: this.mapOrganizationTypeToCode(
          this.profileForm.get('organizationType')?.value || ''
        ),
        stateId: parseInt(this.profileForm.get('state')?.value) || 0,
        districtId: parseInt(this.profileForm.get('district')?.value) || 0,
        address: this.profileForm.get('address')?.value || '',
        contactName: this.profileForm.get('contactPersonName')?.value || '',
        designation: this.profileForm.get('designation')?.value || '',
        contactNumber: this.profileForm.get('contactNumber')?.value || '',
        email: this.profileForm.get('emailId')?.value || '',

        // latitude: this.profileForm.get('latitude')?.value || null,
        // longitude: this.profileForm.get('longitude')?.value || null,
      };

      // Append instituteDetails as JSON string with explicit content type

      this.authService
        .updateOrganization(targetOrganizationId, organizationDetails)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              // Show success message with registration details
              const registrationId = response.data?.registrationNumber || 'N/A';

              // Reset form after successful registration
              this.profileForm.reset();
              this.editOrganizationId = null;
              this.originalOrganizationCode = '';

              this.toastr.success(
                `Organization profile updated successfully!`,
                'Success'
              );
              if (this.formSubmissionSuccess.observers.length > 0) {
                this.formSubmissionSuccess.emit();
              } else {
                this.router.navigate(['/admin/organization-table']);
              }
            } else {
              this.toastr.error(response.message || 'Updation failed', 'Error');
            }
          },
          error: (error) => {
            this.isLoading = false;
            const errorMessage =
              error.error?.message || 'Updation failed. Please try again.';
            this.toastr.error(errorMessage, 'Error');
            console.error('Updation error:', error);
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
      const file = input.files[0];

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'File Error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file', 'File Error');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  onFileSelectedDoc(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'File Error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('application/pdf')) {
        this.toastr.error('Please select a valid PDF file', 'File Error');
        return;
      }

      this.selectedFileDoc = file;

      // Create preview (if needed)
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedDocPreview = file.name as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Trigger file input click
   */
  triggerFileInput() {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  }

  triggerFileInputImage() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const secondFileInput = fileInputs[1] as HTMLInputElement;
    secondFileInput?.click();
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }
  onDragOverDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOverDoc = true;
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }
  onDragLeaveDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOverDoc = false;
  }

  /**
   * Handle drop event
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'File Error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file', 'File Error');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  onDropDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        this.toastr.error('File size must be less than 5MB', 'File Error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('application/pdf')) {
        this.toastr.error('Please select a valid document file', 'File Error');
        return;
      }

      this.selectedFileDoc = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedDocPreview = file.name as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remove selected image
   */
  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.selectedImagePreview = null;

    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  removeDoc(event: Event) {
    event.stopPropagation();
    this.selectedFileDoc = null;
    this.selectedDocPreview = null;

    // Reset file input
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Toggle password visibility
   */
  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Mark all form fields as touched
   */
  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Handle cancel button click
   */
  onCancel() {
    if (this.userRole == 6 && this.organizationData) {
      this.initializeForm();
    } else {
      this.profileForm.reset();
      this.editOrganizationId = null;
      this.originalOrganizationCode = '';
    }

    this.selectedFile = null;
    this.selectedFileDoc = null;
    this.selectedImagePreview = null;
    this.selectedDocPreview = null;

    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
    if (this.formCanceled.observers.length > 0) {
      this.formCanceled.emit();
    }
  }

  get isUpdateMode(): boolean {
    return this.userRole == 6 || !!this.editOrganizationId;
  }

  validatePassword(password: string) {
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.hasSpecialChar = /[@$!%*?&]/.test(password);
  }

}
