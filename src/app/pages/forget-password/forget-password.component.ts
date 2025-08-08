import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  forgetPasswordForm: FormGroup;
  showPassword = false;
  showconfirmPassword = false;
  showoldPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.email]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleconfirmPassword() {
    this.showconfirmPassword = !this.showconfirmPassword;
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

    const { email, password } = this.forgetPasswordForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.data) {
          this.toastr.success('Login successful!', 'Welcome');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Invalid email or password';
          this.toastr.error('Invalid email or password', 'Login Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Login failed. Please try again.';
        this.toastr.error(
          'Login failed. Please check your credentials.',
          'Error'
        );
        console.error('Login error:', error);
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
