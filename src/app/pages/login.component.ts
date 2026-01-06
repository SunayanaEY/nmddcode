import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ModalConfig, ModalComponent } from '../components/modal/modal.component';
import { TrainingService } from './training/services/training.service';
import { LatestCertificateLayoutComponent } from './latest-certificate-layout/latest-certificate-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import { HeartbeatService } from './training/services/heartbeat-service.service';
import { IndiaMapComponent } from './public-dashboard/components/india-map/india-map.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    IndiaMapComponent,
    ModalComponent,
    LatestCertificateLayoutComponent,
    TranslateModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  signInForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  selectedState: any = null;

  showModal = false;
  selectedItem: any;
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private trainingsService: TrainingService,
    private heartbeatService: HeartbeatService
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['message']) {
        this.toastr.warning(params['message'], 'Session Expired', {
          timeOut: 5000,
          closeButton: true,
        });
      }
    });
  }

  onStateSelected(stateData: any): void {
    this.selectedState = stateData;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      this.toastr.error('Please fill in all required fields correctly', 'Validation Error');
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
          const user = JSON.parse(sessionStorage.getItem('user') || '{}');
          const authToken = user.authData;
          if (authToken != null) {
            this.onLoginSuccess(authToken);
          }

          this.redirectBasedOnRole(response.data.role);
        } else {
          this.errorMessage = 'Invalid email or password';
          this.toastr.error('Invalid email or password', 'Login Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
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

  onLoginSuccess(token: string) {
    localStorage.setItem('authToken', token);
    this.heartbeatService.startHeartbeat();
  }

  private redirectBasedOnRole(role: number): void {
    switch (role) {
      case 1:
      case 5:
      case 6:
        this.router.navigate(['/admin/dashboard']);
        break;
      case 3:
        this.router.navigate(['/admin/role-dashboard']);
        break;
      case 4:
        this.router.navigate(['/admin/role-dashboard']);
        break;
      default:
        this.router.navigate(['/admin']);
    }
  }

  downloadCertificate(): void {
    this.showModal = true;
  }

  onClose() {
    this.showModal = false;
  }

  onSubmit(formData: any) {
    this.trainingsService
      .getCertificateDetails(formData.uin, formData.gmail, formData.phone)
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            const modifiedData = {
              ...res.data,
              location: `${res.data.venueBlock}, ${res.data.venueDistrict}, ${res.data.venueState}`,
              trainingDate: `${res.data.trainingDate}`,
            };

            this.selectedItem = modifiedData;

            const modalElement = document.getElementById('viewCertificateModal');
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
    this.showModal = false;
  }

  onSecondaryAction() {
    this.showModal = false;
  }
}
