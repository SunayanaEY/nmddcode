import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';
import { UserProfileService } from './services/user-profile.service';
import { RegisterInstituteRequest } from './models/user-profile.model';

@Component({
  selector: 'app-user-profile-creation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BreadcrumbComponent],
  templateUrl: './user-profile-creation.component.html',
  styleUrls: ['./user-profile-creation.component.css'],
})
export class UserProfileCreationComponent {
  profileForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard/training-module' },
    { label: 'User Profile', url: '' },
  ];

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService
  ) {
    this.profileForm = this.fb.group({
      instituteName: [
        '',
        Validators.required,
      ],
      scheme: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      block: ['', Validators.required],
      registrationId: [''],
      contactPersonName: ['', Validators.required],
      designation: ['', Validators.required],
      contactNumber: ['', [Validators.required]],
      emailId: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';

      const formData: RegisterInstituteRequest = {
        trainingInstituteName: this.profileForm.value.instituteName,
        scheme: this.profileForm.value.scheme,
        state: this.profileForm.value.state,
        district: this.profileForm.value.district,
        block: this.profileForm.value.block,
        registrationId: this.profileForm.value.registrationId || '',
        contactPersonName: this.profileForm.value.contactPersonName,
        designation: this.profileForm.value.designation,
        contactNumber: this.profileForm.value.contactNumber,
        emailId: this.profileForm.value.emailId
      };

      this.userProfileService.registerInstitute(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = response.message || 'Institute registered successfully!';
            this.profileForm.reset();
          } else {
            this.errorMessage = response.message || 'Registration failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
          console.error('Registration error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}