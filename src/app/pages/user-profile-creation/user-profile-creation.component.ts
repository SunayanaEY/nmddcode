import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../components/breadcrumb/breadcrumb.component';
import { UserProfileService } from './services/user-profile.service';
import { Router } from '@angular/router';
import {
  RegisterInstituteRequest,
  RegisterDataEntryOperatorRequest,
} from './models/user-profile.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-profile-creation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './user-profile-creation.component.html',
  styleUrls: ['./user-profile-creation.component.css'],
})
export class UserProfileCreationComponent implements OnInit {
  @Output() formSubmissionSuccess = new EventEmitter<void>();
  
  profileForm: FormGroup;
  isLoading = false;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Manager Profile Creation', url: '' },
  ];

  // Password validation properties
  hasMinLength = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group(
      {
        operatorName: ['', Validators.required],
        designation: ['', Validators.required],
        contactNumber: [
          '',
          [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
        ],
        emailId: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    // Subscribe to password field changes for real-time validation
    setTimeout(() => {
      this.profileForm.get('password')?.valueChanges.subscribe((password) => {
        this.validatePassword(password || '');
      });
    }, 0);
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;

      // Get trainingHeadId from session storage
      const sessionData = sessionStorage.getItem('user');
      let trainingHeadId = '';

      if (sessionData) {
        try {
          const userData = JSON.parse(sessionData);
          trainingHeadId = userData.trainingHeadId || '';
        } catch (error) {
          console.error('Error parsing session data:', error);
          this.toastr.error('Session data error. Please login again.', 'Error');
          this.isLoading = false;
          return;
        }
      }

      if (!trainingHeadId) {
        this.toastr.error(
          'Training Head ID not found. Please login again.',
          'Error'
        );
        this.isLoading = false;
        return;
      }

      const formData: RegisterDataEntryOperatorRequest = {
        operatorName: this.profileForm.value.operatorName,
        designation: this.profileForm.value.designation,
        contactNumber: this.profileForm.value.contactNumber,
        emailId: this.profileForm.value.emailId,
        password: this.profileForm.value.password,
        trainingHeadId: trainingHeadId,
      };

      this.userProfileService.registerDataEntryOperator(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastr.success(
              response.message ||
                'Data Entry Operator registered successfully!',
              'Success'
            );
            this.profileForm.reset();
            this.formSubmissionSuccess.emit();
          } else {
            this.toastr.error(
              response.message || 'Registration failed. Please try again.',
              'Error'
            );
          }
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage =
            error.error?.message || 'An error occurred. Please try again.';
          this.toastr.error(errorMessage, 'Error');
          console.error('Registration error:', error);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  get passwordMismatch() {
    return (
      this.profileForm.hasError('passwordMismatch') &&
      this.profileForm.get('confirmPassword')?.touched
    );
  }

  /**
   * Validate password against policy requirements
   */
  private validatePassword(password: string): void {
    this.hasMinLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasLowercase = /[a-z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  }
}
