import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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

@Component({
  selector: 'app-training-centre-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent],
  templateUrl: './training-centre-admin-profile.component.html',
  styleUrls: ['./training-centre-admin-profile.component.css'],
})
export class TrainingCentreAdminProfileComponent implements OnInit {
  @Output() formSubmitted = new EventEmitter<void>();
  
  profileForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileDoc: File | null = null;
  selectedImagePreview: string | null = null;
  selectedDocPreview: string | null = null;
  isDragOver = false;
  isDragOverDoc = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  userRole: any;
  instituteData: any;
  trainingInstituteId: any;
  userId: any;
  today: string | undefined;

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
    private route: ActivatedRoute
  ) {
    this.getRole();
    if (this.userRole == 5 || this.userRole == 6) {
      const nav = this.router.getCurrentNavigation();
      const passedData = nav?.extras.state?.['data'];
      this.trainingInstituteId = passedData.id;
      this.instituteData = passedData;
      // alert(JSON.stringify(this.instituteData));
    }

    if (this.userRole == 1) {
      this.profileForm = this.fb.group({
        trainingInstituteName: [
          '',
          [Validators.required, Validators.minLength(3)],
        ],
        instituteType: ['', [Validators.required]],
        trainingInstituteRegistration: [
          '',
          [Validators.required, Validators.minLength(3)],
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
          // Reset district selection when state changes
          this.profileForm.get('district')?.setValue('');
        } else {
          this.districts = [];
          this.profileForm.get('district')?.setValue('');
        }
      });
    } else {
      this.profileForm = this.fb.group(
        {
          instituteType: ['', [Validators.required]],
          contactPersonName: [
            '',
            [Validators.required, Validators.minLength(2)],
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
          trainingInstituteName: [
            '',
            [Validators.required, Validators.minLength(3)],
          ],
          trainingInstituteRegistration: [
            '',
            [Validators.required, Validators.minLength(3)],
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
        },
        { validators: this.passwordMatchValidator }
      );
    }
  }

  ngOnInit() {
    const now = new Date();
    this.today = now.toISOString().split('T')[0];
    this.loadStates();
    if (this.userRole == 5 || this.userRole == 6) {
      this.initializeForm();
    }
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
    this.profileForm.patchValue({
      trainingInstituteName: this.instituteData.trainingInstituteName,
      trainingInstituteRegistration: this.instituteData.registrationId,
      trainingInstituteExpiry: this.instituteData.expiryDate
        ? this.instituteData.expiryDate.split('T')[0]
        : '',
      instituteType: this.instituteData.instituteType,
      state: this.instituteData.stateId,
      address: this.instituteData.address,
      latitude: this.instituteData.latitude,
      longitude: this.instituteData.longitude,
    });
    this.loadDistricts(this.instituteData.stateId);
    this.profileForm.patchValue({
      district: this.instituteData.districtId,
    });
    // Disable controls
    this.profileForm.get('trainingInstituteName')?.disable();
    this.profileForm.get('trainingInstituteRegistration')?.disable();
    this.profileForm.get('trainingInstituteExpiry')?.disable();
    this.profileForm.get('instituteType')?.disable();
    this.profileForm.get('state')?.disable();
    this.profileForm.get('address')?.disable();
    this.profileForm.get('latitude')?.disable();
    this.profileForm.get('longitude')?.disable();
    this.profileForm.get('district')?.disable();
  }
  /**
   * Handle form submission
   */
  onSubmit() {
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

      const instituteDetails = {
        instituteName:
          this.profileForm.get('trainingInstituteName')?.value || '',
        registrationNumber:
          this.profileForm.get('trainingInstituteRegistration')?.value || '',
        registrationValidity: expiryValue ? expiryValue + 'T00:00:00' : '',
        instituteType: this.profileForm.get('instituteType')?.value || '',
        stateId: parseInt(this.profileForm.get('state')?.value) || 0,
        districtId: parseInt(this.profileForm.get('district')?.value) || 0,
        address: this.profileForm.get('address')?.value || '',
        latitude: this.profileForm.get('latitude')?.value || null,
        longitude: this.profileForm.get('longitude')?.value || null,
      };

      // Append instituteDetails as JSON string with explicit content type
      const instituteDetailsBlob = new Blob(
        [JSON.stringify(instituteDetails)],
        {
          type: 'application/json',
        }
      );
      formData.append('data', instituteDetailsBlob);

      // Append image file
      formData.append('registrationDoc', this.selectedFileDoc);
      formData.append('instituteImage', this.selectedFile);
      this.authService.createInstitute(this.userId, formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            // Show success message with registration details
            const registrationId = response.data?.registrationId || 'N/A';
            const instituteName = response.data?.trainingInstituteName || 'N/A';
            const status = response.data?.status || 'PENDING';

            // Reset form after successful registration
            this.profileForm.reset();
            this.selectedFile = null;
            this.selectedImagePreview = null;

            this.toastr.success(
              `Training Centre Admin profile created successfully! Registration ID: ${registrationId}`,
              'Success'
            );

            // Emit event to notify parent component
            this.formSubmitted.emit();

            // Navigate to training centre component after successful registration
            // this.router.navigate(['/admin/training-centre']);
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

      // Create FormData for multipart request
      // Create instituteDetails object matching the API structure
      const instituteDetails = {
        contactPersonName:
          this.profileForm.get('contactPersonName')?.value || '',
        designation: this.profileForm.get('designation')?.value || '',
        contactNumber: this.profileForm.get('contactNumber')?.value || '',
        emailId: this.profileForm.get('emailId')?.value || '',
        password: this.profileForm.get('password')?.value || '',
      };

      // Append instituteDetails as JSON string with explicit content type

      this.authService
        .updateInstitute(this.trainingInstituteId, instituteDetails)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              // Show success message with registration details
              const registrationId = response.data?.registrationId || 'N/A';
              const instituteName =
                response.data?.trainingInstituteName || 'N/A';
              const status = response.data?.status || 'PENDING';

              // Reset form after successful registration
              this.profileForm.reset();
              this.selectedFile = null;
              this.selectedImagePreview = null;

              this.toastr.success(
                `Training Centre Admin profile updated successfully! Registration ID: ${registrationId}`,
                'Success'
              );

              // Emit event to notify parent component
              this.formSubmitted.emit();

              // Navigate to training centre component after successful registration
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
    this.router.navigate(['/admin/training-module']);
  }
}
