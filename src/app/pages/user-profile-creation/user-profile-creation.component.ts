import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
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
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard/training-module' },
    { label: 'User Profile', url: '' },
  ];

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      operatorName: ['', Validators.required],
      designation: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      emailId: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;

      const formData: RegisterInstituteRequest = {
        operatorName: this.profileForm.value.operatorName,
        designation: this.profileForm.value.designation,
        contactNumber: this.profileForm.value.contactNumber,
        emailId: this.profileForm.value.emailId,
        password: this.profileForm.value.password
      };

      this.userProfileService.registerInstitute(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastr.success(response.message || 'Institute registered successfully!', 'Success');
            this.profileForm.reset();
          } else {
            this.toastr.error(response.message || 'Registration failed. Please try again.', 'Error');
          }
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'An error occurred. Please try again.';
          this.toastr.error(errorMessage, 'Error');
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

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get passwordMismatch() {
    return this.profileForm.hasError('passwordMismatch') && 
           this.profileForm.get('confirmPassword')?.touched;
  }
}