import { Component, OnInit } from '@angular/core';
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
import { TranslateModule } from '@ngx-translate/core';
import { AdminService } from '../training/services/training-admin.service';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';
import { District, LocationService, State } from '../../services/location.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-organization-component',
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent,TranslateModule],
  templateUrl: './organization-component.component.html',
  styleUrl: './organization-component.component.css'
})
export class OrganizationComponentComponent implements OnInit {

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
  error: string | null = null;
  organizationData: any;
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

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/dashboard' },
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
          [Validators.required, Validators.minLength(3)],
        ],
        instituteType: ['', [Validators.required]],
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
    this.profileForm.patchValue({
      organizationName: this.organizationData.organizationName,
      trainingInstituteRegistration: this.organizationData.registrationNumber,
      organizationType: this.organizationData.instituteType,
      state: this.organizationData.stateId,
      address: this.organizationData.address,
      contactPersonName: this.organizationData.contactName,
      designation: this.organizationData.designation,
      contactNumber: this.organizationData.contactNumber,
      emailId: this.organizationData.email,
    });
    this.loadDistricts(this.organizationData.stateId);
    this.profileForm.patchValue({
      district: this.organizationData.districtId,
    });
  }

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
              `Organization Admin profile created successfully.`,
              'Success'
            );

            // Navigate to training centre component after successful registration
            this.router.navigate(['admin/training-module']);
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
        password: this.profileForm.get('password')?.value || '',

        // latitude: this.profileForm.get('latitude')?.value || null,
        // longitude: this.profileForm.get('longitude')?.value || null,
      };

      // Append instituteDetails as JSON string with explicit content type

      this.authService
        .updateOrganization(this.userId, organizationDetails)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              // Show success message with registration details
              const registrationId = response.data?.registrationNumber || 'N/A';

              // Reset form after successful registration
              this.profileForm.reset();

              this.toastr.success(
                `Organization profile updated successfully! Registration ID: ${registrationId}`,
                'Success'
              );

              // Navigate to training centre component after successful registration
              this.router.navigate(['/admin/training-module']);
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
    this.router.navigate(['/admin/training-module']);
  }
}
