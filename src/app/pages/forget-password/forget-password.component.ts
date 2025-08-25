import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  type: string | null = null;
  // forgetPasswordForm: FormGroup;
  forgetPasswordForm: FormGroup;
  showPassword = false;
  showoldPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.forgetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.type = params['type'];
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  sendOTP() {
    if (this.forgetPasswordForm.get('email')?.invalid) {
      this.forgetPasswordForm.get('email')?.markAsTouched();
      this.toastr.error('Please enter a valid email', 'Validation Error');
      return;
    }

    this.isLoading = true;
    const email = this.forgetPasswordForm.get('email')?.value;

    this.authService.forgetPasswordOTP(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response) {
          this.toastr.success('OTP Sent Successfully!');
        } else {
          this.errorMessage = 'Invalid email';
          this.toastr.error('Invalid email');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to Send OTP. Please try again.';
        this.toastr.error('Failed to Send OTP. Please try again.', 'Error');
      },
    });
  }

  onForgetPassword() {
    if (this.forgetPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgetPasswordForm);
      this.toastr.error(
        'Please fill in all required fields correctly',
        'Validation Error'
      );
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, otp, newPassword } = this.forgetPasswordForm.value;

    this.authService.forgetPassword(email, otp, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.status == 200) {
          this.toastr.success('Password Set Successfully!');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Invalid Email, OTP or Password';
          this.toastr.error('Invalid Email, OTP or Password');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to Set Password. Please try again.';
        this.toastr.error('Failed to Set Password. Please try again.', 'Error');
      },
    });
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
