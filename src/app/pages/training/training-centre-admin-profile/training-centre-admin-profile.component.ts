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
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { LocationService, State, District } from '../../../services/location.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-training-centre-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent],
  templateUrl: './training-centre-admin-profile.component.html',
  styleUrls: ['./training-centre-admin-profile.component.css']
})
export class TrainingCentreAdminProfileComponent implements OnInit {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  selectedImagePreview: string | null = null;
  isDragOver = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  // Location data
  states: State[] = [];
  districts: District[] = [];
  isLoadingStates = false;
  isLoadingDistricts = false;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training', url: '/admin/training-module' },
    { label: 'Training Centre Admin Profile Creation' }
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
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        trainingInstituteName: [
          '',
          [Validators.required, Validators.minLength(3)],
        ],
        state: ['', [Validators.required]],
        district: ['', [Validators.required]],
        contactPersonName: ['', [Validators.required, Validators.minLength(2)]],
        designation: ['', [Validators.required]],
        contactNumber: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
        ],
        emailId: ['', [Validators.required, Validators.email]],
        address: ['', [Validators.required, Validators.minLength(10)]],
        latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
        longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
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
  }

  ngOnInit() {
    this.loadStates();
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

    if (!this.selectedFile) {
      this.toastr.error('Please select an institute image', 'Validation Error');
      return;
    }

    this.isLoading = true;

    // Create FormData for multipart request
    const formData = new FormData();

    // Create instituteDetails object matching the API structure
    const instituteDetails = {
      username: this.profileForm.get('username')?.value || '',
      trainingInstituteName: this.profileForm.get('trainingInstituteName')?.value || '',
      stateId: parseInt(this.profileForm.get('state')?.value) || 0,
      districtId: parseInt(this.profileForm.get('district')?.value) || 0,
      block: '', // Not in current form, can be added if needed
      contactPersonName: this.profileForm.get('contactPersonName')?.value || '',
      designation: this.profileForm.get('designation')?.value || '',
      contactNumber: this.profileForm.get('contactNumber')?.value || '',
      emailId: this.profileForm.get('emailId')?.value || '',
      address: this.profileForm.get('address')?.value || '',
      latitude: this.profileForm.get('latitude')?.value || null,
      longitude: this.profileForm.get('longitude')?.value || null,
      password: this.profileForm.get('password')?.value || '',
    };

    // Append instituteDetails as JSON string with explicit content type
    const instituteDetailsBlob = new Blob([JSON.stringify(instituteDetails)], {
      type: 'application/json',
    });
    formData.append('instituteDetails', instituteDetailsBlob);

    // Append image file
    formData.append('instituteImage', this.selectedFile);

    // Call the registration API
    this.authService.register(formData).subscribe({
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
           
           // Navigate to training centre component after successful registration
           this.router.navigate(['/admin/training-centre']);
        } else {
          this.toastr.error(response.message || 'Registration failed', 'Error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.toastr.error(errorMessage, 'Error');
        console.error('Registration error:', error);
      },
    });
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

  /**
   * Trigger file input click
   */
  triggerFileInput() {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
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

  /**
   * Remove selected image
   */
  removeImage(event: Event) {
    event.stopPropagation();
    this.selectedFile = null;
    this.selectedImagePreview = null;
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
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
    Object.keys(formGroup.controls).forEach(key => {
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
    this.router.navigate(['/training']);
  }
}