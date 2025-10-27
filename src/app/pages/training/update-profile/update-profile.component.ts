import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../services/auth.service';
import { LocationService, State, District } from '../../../services/location.service';
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent,TranslateModule],
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.css']
})
export class UpdateProfileComponent implements OnInit {
  updateProfileForm!: FormGroup;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  selectedImageFile: File | null = null;
  currentImageUrl: string | null = null;
  profileData: any = null;
  states: State[] = [];
  districts: District[] = [];
  selectedStateId: number | null = null;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Dashboard', url: '/admin/training-module' },
    { label: 'Update Profile' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private locationService: LocationService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Debug authentication status
    console.log('Update Profile Component - Checking authentication:');
    console.log('Is logged in:', this.authService.isLoggedIn());
    console.log('Current user:', this.authService.getUser());

    this.loadProfileData();
    this.loadStates();
  }

  initializeForm(): void {
    this.updateProfileForm = this.fb.group({
      instituteName: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      emailId: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      latitude: ['', [Validators.required]],
      longitude: ['', [Validators.required]],
      registrationId: [''],
      currentStateId: [''],
      currentDistrictId: [''],
      currentStateName: [''],
      currentDistrictName: [''],
      newStateId: [''],
      newDistrictId: [''],
      block: ['']
    });

    // Watch for state changes to load districts
    this.updateProfileForm.get('newStateId')?.valueChanges.subscribe(stateId => {
      if (stateId) {
        this.selectedStateId = stateId;
        this.loadDistrictsByState(stateId);
        // Reset district selection when state changes
        this.updateProfileForm.get('newDistrictId')?.setValue('');
      } else {
        this.districts = [];
        this.updateProfileForm.get('newDistrictId')?.setValue('');
      }
    });
  }



  loadProfileData(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get(`${environment.apiUrl}training/trainingInstitutes`).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Profile data loaded:', response);
        if (response.success && response.data && response.data.length > 0) {
          this.profileData = response.data[0]; // Store the complete profile data
          this.populateForm(this.profileData);

          // Set current image URL if available
          if (this.profileData.instituteImageUrl) {
            this.currentImageUrl = this.profileData.instituteImageUrl;
          }
        } else {
           this.error = 'No profile data available';
         }
       },
       error: (error) => {
         this.isLoading = false;
         console.error('Error loading profile data:', error);
         this.error = 'Failed to load profile data';
       }
     });
   }

  loadStates(): void {
    this.locationService.getStates().subscribe({
      next: (states) => {
        this.states = states;
      },
      error: (error) => {
        console.error('Error loading states:', error);
      }
    });
  }

  loadDistrictsByState(stateId: number): void {
    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts) => {
        this.districts = districts;
      },
      error: (error) => {
        console.error('Error loading districts:', error);
      }
    });
  }

  populateForm(data: any): void {
    this.updateProfileForm.patchValue({
      instituteName: data.trainingInstituteName || '',
      contactPerson: data.contactPersonName || '',
      designation: data.designation || '',
      contactNumber: data.contactNumber || '',
      emailId: data.emailId || '',
      address: data.address || '',
      latitude: data.latitude || '',
      longitude: data.longitude || '',
      registrationId: data.registrationId || '',
      currentStateId: data.stateId || '',
      currentDistrictId: data.districtId || '',
      currentStateName: data.state || '',
      currentDistrictName: data.district || ''
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Please select a valid image file (JPG, PNG, GIF)';
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'File size must be less than 5MB';
        return;
      }

      this.selectedImageFile = file;
      this.error = null;

      // Preview the image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.currentImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.updateProfileForm.valid) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      const formData = new FormData();
      const formValues = this.updateProfileForm.value;
      const user = this.authService.getUser();

      // Determine final state and district IDs
      const finalStateId = formValues.newStateId || this.profileData?.stateId || '';
      const finalDistrictId = formValues.newDistrictId || this.profileData?.districtId || '';

      // Create institute details JSON object using profile data and form values
      const instituteDetails = {
        id: this.profileData?.id || '', // Use the institute ID from profile data
        username: user?.username || '',
        trainingInstituteName: formValues.instituteName || '',
        stateId: finalStateId,
        districtId: finalDistrictId,
        block: formValues.block || '',
        contactPersonName: formValues.contactPerson || '',
        designation: formValues.designation || '',
        contactNumber: formValues.contactNumber || '',
        emailId: formValues.emailId || '',
        address: formValues.address || '',
        latitude: parseFloat(formValues.latitude) || 0,
        longitude: parseFloat(formValues.longitude) || 0,
        password: null // Set password to null as requested
      };

      // Create a blob for the JSON data and append it as 'instituteDetails'
      const jsonBlob = new Blob([JSON.stringify(instituteDetails)], {
        type: 'application/json'
      });
      formData.append('instituteDetails', jsonBlob, 'blob');

      // Append image file if selected
      if (this.selectedImageFile) {
        formData.append('instituteImage', this.selectedImageFile, this.selectedImageFile.name);
      }

      // Make the API call to update profile using POST method
      this.http.post(`${environment.apiUrl}api/auth/registerInstitute`, formData).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.success = 'Profile updated successfully!';
          // Optionally reload the profile data
          setTimeout(() => {
            this.loadProfileData();
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating profile:', error);
          this.error = error.error?.message || 'Failed to update profile';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.updateProfileForm.controls).forEach(key => {
      const control = this.updateProfileForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.updateProfileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.updateProfileForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid 10-digit phone number';
      }
    }
    return '';
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }
}
