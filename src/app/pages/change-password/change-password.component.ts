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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  type: string | null = null;
  // forgetPasswordForm: FormGroup;
  resetPasswordForm: FormGroup;
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
    // this.forgetPasswordForm = this.fb.group({
    //   newPassword: ['', [Validators.required, Validators.email]],
    //   confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
    // });
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      oldPassword: ['', [Validators.required]],
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
  toggleOldPassword() {
    this.showoldPassword = !this.showoldPassword;
  }
  onResetPassword() {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      this.toastr.error(
        'Please fill in all required fields correctly',
        'Validation Error'
      );
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const { email, oldPassword, newPassword } = this.resetPasswordForm.value;

    this.authService.changePassword(email, oldPassword, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.status == 200) {
          this.toastr.success('Password Changed successfully!');
          this.router.navigate(['admin/training-module']);
        } else {
          this.errorMessage = 'Invalid email or password';
          this.toastr.error(
            'Invalid email or password',
            'Password Change Failed'
          );
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Password not Changed. Please try again.';
        this.toastr.error('Password not Changed. Please try again.', 'Error');
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
