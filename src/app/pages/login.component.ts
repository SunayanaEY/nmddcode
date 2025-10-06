import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LocationService, State, District } from '../services/location.service';
import { GeocodingService, GeocodeResult } from '../services/geocoding.service';
import { ToastrService } from 'ngx-toastr';
import { OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IndiaMapComponent } from './public-dashboard/components/india-map/india-map.component';
import { StateData } from './public-dashboard/public-dashboard.component';
import {
  ModalConfig,
  ModalComponent,
} from '../components/modal/modal.component';
import { TrainingService } from './training/services/training.service';
import { CertificateLayoutComponent } from './certificate-layout/certificate-layout.component';
import { NewCertificateLayoutComponent } from './new-certificate-layout/new-certificate-layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IndiaMapComponent,
    ModalComponent,
    NewCertificateLayoutComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  isSignUp = false;
  signInForm: FormGroup;
  signUpForm: FormGroup;
  selectedFile: File | null = null;
  selectedImagePreview: string | null = null;
  isDragOver = false;
  showPassword = false;
  showSignUpPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  // Location data
  states: State[] = [];
  districts: District[] = [];
  isLoadingStates = false;
  isLoadingDistricts = false;

  // Address and geocoding
  isGeocodingAddress = false;
  addressLatitude: number | null = null;
  addressLongitude: number | null = null;

  //India Map
  selectedState: StateData | null = null;
  onStateSelected(stateData: StateData): void {
    this.selectedState = stateData;
    // Update charts and stats based on selected state
    console.log('Selected state:', stateData);
  }

  //Certificate Dwonload
  downloadCertificate(): void {
    // TODO: Implement certificate download functionality
    this.showModal = true;
  }
  showModal = false;
  modalConfig: ModalConfig = {
    title: 'Certificate Download',
    showCloseButton: true,
    showFooter: true,
    primaryButtonText: 'Submit',
    secondaryButtonText: 'Close',
    fields: [
      {
        id: 'uin',
        label: 'UIN',
        type: 'text',
        placeholder: 'Enter UIN',
        required: true,
      },
    ],
  };

  onClose() {
    this.showModal = false;
  }
  selectedItem: any;

  onSubmit(formData: any) {
    this.trainingsService
      .getCertificateDetails(formData.uin, formData.gmail, formData.phone)
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            // Clone the data so we don’t overwrite directly
            const modifiedData = {
              ...res.data,
              location: `${res.data.venueBlock}, ${res.data.venueDistrict}, ${res.data.venueState}`,
              trainingDate: new Date(res.data.trainingDate).toLocaleDateString(
                'en-GB'
              ), // dd/mm/yyyy
            };

            this.selectedItem = modifiedData;

            const modalElement = document.getElementById(
              'viewCertificateModal'
            );
            if (modalElement) {
              const modal = new (window as any).bootstrap.Modal(modalElement);
              modal.show();
            }
          } else {
            console.warn('No data found in response:', res);
          }
        },
        error: (err) => {
          console.error('Error fetching trainees:', err);
        },
      });

    this.showModal = false; // close modal after submit
  }
  onSecondaryAction() {
    this.showModal = false;
  }

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
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private locationService: LocationService,
    private geocodingService: GeocodingService,
    private trainingsService: TrainingService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.signUpForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        trainingInstituteName: [
          '',
          [Validators.required, Validators.minLength(3)],
        ],
        state: ['', [Validators.required]],
        district: ['', [Validators.required]],
        block: [''], // Optional field without validators
        contactPersonName: ['', [Validators.required, Validators.minLength(2)]],
        designation: ['', [Validators.required]],
        contactNumber: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
        ],
        emailId: ['', [Validators.required, Validators.email]],
        address: ['', [Validators.required, Validators.minLength(10)]],
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
    this.signUpForm.get('state')?.valueChanges.subscribe((stateId) => {
      if (stateId) {
        this.loadDistricts(stateId);
        // Reset district selection when state changes
        this.signUpForm.get('district')?.setValue('');
      } else {
        this.districts = [];
        this.signUpForm.get('district')?.setValue('');
      }
    });
  }

  ngOnInit() {
    this.loadStates();

    // Check for session expiry message
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.toastr.warning(params['message'], 'Session Expired', {
          timeOut: 5000,
          closeButton: true,
        });
      }
    });
  }

  /**
   * Load states from API
   */
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

  /**
   * Load districts based on selected state
   * @param stateId - Selected state ID
   */
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

  onSignIn() {
    if (this.signInForm.invalid) {
      this.markFormGroupTouched(this.signInForm);
      this.toastr.error(
        'Please fill in all required fields correctly',
        'Validation Error'
      );
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.signInForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.toastr.success('Login successful!', 'Welcome');
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('roleId', response.data.role.toString());

          // Role-based redirect
          this.redirectBasedOnRole(response.data.role);
        } else {
          this.errorMessage = 'Invalid email or password';
          this.toastr.error('Invalid email or password', 'Login Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        // Extract specific error message from server response
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.errorMessage = errorMessage;
        this.toastr.error(errorMessage, 'Login Failed');
        console.error('Login error:', error);
      },
    });
  }

  onSignUp() {
    if (this.signUpForm.invalid) {
      this.markFormGroupTouched(this.signUpForm);
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

    // Check if address is provided but not geocoded yet
    const addressValue = this.signUpForm.get('address')?.value;
    if (
      addressValue &&
      addressValue.trim().length > 10 &&
      !this.addressLatitude &&
      !this.addressLongitude
    ) {
      this.toastr.warning(
        'Please wait for address validation to complete or check your address.',
        'Address Validation'
      );
      // Trigger geocoding if not done yet
      this.onAddressChange();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Create FormData for multipart request
    const formData = new FormData();

    // Create instituteDetails object
    const instituteDetails = {
      username: this.signUpForm.get('username')?.value || '',
      trainingInstituteName:
        this.signUpForm.get('trainingInstituteName')?.value || '',
      stateId: parseInt(this.signUpForm.get('state')?.value) || 0,
      districtId: parseInt(this.signUpForm.get('district')?.value) || 0,
      block: this.signUpForm.get('block')?.value || '',
      contactPersonName: this.signUpForm.get('contactPersonName')?.value || '',
      designation: this.signUpForm.get('designation')?.value || '',
      contactNumber: this.signUpForm.get('contactNumber')?.value || '',
      emailId: this.signUpForm.get('emailId')?.value || '',
      address: this.signUpForm.get('address')?.value || '',
      latitude: this.addressLatitude,
      longitude: this.addressLongitude,
      password: this.signUpForm.get('password')?.value || '',
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
          this.signUpForm.reset();
          this.selectedFile = null;

          // Optionally redirect to login or dashboard
          // this.router.navigate(['/login']);
          this.toastr.success(
            'Account created successfully! Registration ID: ' +
              response.data.registrationId,
            'Success'
          );
          this.isSignUp = false; // Switch to sign in form
          // Reset form
          this.signUpForm.reset();
          this.selectedFile = null;
          this.selectedImagePreview = null;
        } else {
          this.errorMessage = response.message || 'Registration failed';
          this.toastr.error(response.message || 'Registration failed', 'Error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage =
          error.error?.message || 'Registration failed. Please try again.';
        this.errorMessage = errorMessage;
        this.toastr.error(errorMessage, 'Error');
        console.error('Registration error:', error);
      },
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, JPEG)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
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

  triggerFileInput() {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, JPEG)');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
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

  removeImage(event: Event) {
    event.preventDefault();
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleSignUpPassword() {
    this.showSignUpPassword = !this.showSignUpPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Geocode the entered address to get latitude and longitude
   */
  onAddressChange() {
    const addressControl = this.signUpForm.get('address');
    if (
      addressControl &&
      addressControl.value &&
      addressControl.value.trim().length > 10
    ) {
      this.isGeocodingAddress = true;

      this.geocodingService.geocodeAddress(addressControl.value).subscribe({
        next: (result: GeocodeResult | null) => {
          this.isGeocodingAddress = false;
          if (result) {
            this.addressLatitude = result.latitude;
            this.addressLongitude = result.longitude;
            this.toastr.success(
              `Address geocoded successfully: ${result.formattedAddress}`,
              'Location Found'
            );
          } else {
            this.addressLatitude = null;
            this.addressLongitude = null;
            this.toastr.warning(
              'Could not find location for this address. Please check and try again.',
              'Location Not Found'
            );
          }
        },
        error: (error) => {
          this.isGeocodingAddress = false;
          this.addressLatitude = null;
          this.addressLongitude = null;
          console.error('Geocoding error:', error);
          this.toastr.error(
            'Error occurred while finding location. Please try again.',
            'Geocoding Error'
          );
        },
      });
    } else {
      this.addressLatitude = null;
      this.addressLongitude = null;
    }
  }

  private redirectBasedOnRole(role: number): void {
    switch (role) {
      case 1: // Central Admin
        this.router.navigate(['/admin/dashboard']);
        break;
      case 3: // Training Institute Head
        this.router.navigate(['/admin/training-module']);
        break;
      case 4: // Training Data Entry Operator
        this.router.navigate(['/admin/training-module']);
        break;
      default:
        this.router.navigate(['/admin']);
    }
  }
}
