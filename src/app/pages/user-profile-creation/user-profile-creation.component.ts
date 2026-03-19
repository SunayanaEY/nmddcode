import { Component, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
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
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  Subscription,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-user-profile-creation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './user-profile-creation.component.html',
  styleUrls: ['./user-profile-creation.component.css'],
})
export class UserProfileCreationComponent implements OnInit, OnDestroy {
  @Input() isEditMode: boolean = false;

  editRowId: string | null = null;

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
  isCheckingUsername = false;
  isUsernameAvailable = false;
  private usernameCheckSubscription?: Subscription;
  private originalUsername = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group(
      {
        operatorName: ['', Validators.required],
        username: [
          '',
          [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{3,30}$/)],
        ],
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
    setTimeout(() => {
      this.profileForm.get('password')?.valueChanges.subscribe((password) => {
        this.validatePassword(password || '');
      });
    }, 0);
    this.setupUsernameAvailabilityCheck();
  }

  ngOnDestroy(): void {
    this.usernameCheckSubscription?.unsubscribe();
  }

  setEditData(data: any): void {
    this.isEditMode = true;
    this.editRowId = data.id;
    this.originalUsername = (data.username || '').toString().trim();

    this.profileForm.patchValue({
      operatorName: data.operatorName,
      username: this.originalUsername,
      designation: data.designation,
      contactNumber: data.contactNumber,
      emailId: data.emailId,
      password: '',
      confirmPassword: '',
    });
    if (this.originalUsername) {
      this.isUsernameAvailable = true;
      this.clearUsernameTakenError();
    }
  }

  onSubmit() {
    const usernameControl = this.profileForm.get('username');
    if (this.isCheckingUsername) {
      usernameControl?.markAsTouched();
      return;
    }

    if (
      usernameControl?.valid &&
      !this.isUsernameAvailable &&
      !usernameControl.errors?.['usernameTaken']
    ) {
      usernameControl.setErrors({
        ...(usernameControl.errors || {}),
        usernameTaken: true,
      });
      usernameControl.markAsTouched();
      return;
    }

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
        username: this.profileForm.value.username,
        designation: this.profileForm.value.designation,
        contactNumber: this.profileForm.value.contactNumber,
        emailId: this.profileForm.value.emailId,
        password: this.profileForm.value.password,
        trainingHeadId: trainingHeadId,
      };

      if (this.isEditMode && this.editRowId) {
        this.userProfileService
          .updateDataEntryOperator(this.editRowId, formData)
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              if (response.status === 200) {
                this.toastr.success('Updated Successfully');
                this.profileForm.reset();
                this.resetUsernameAvailabilityState();
                this.isEditMode = false;
                this.editRowId = null;
                this.originalUsername = '';
                this.formSubmissionSuccess.emit();
              }
            },
            error: () => (this.isLoading = false),
          });
      } else {
        this.userProfileService.registerDataEntryOperator(formData).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.toastr.success('Registered Successfully');
              this.profileForm.reset();
              this.resetUsernameAvailabilityState();
              this.formSubmissionSuccess.emit();
            }
          },
          error: () => (this.isLoading = false),
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }
  allowOnlyAlphabets(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;

    if (
      !(charCode >= 65 && charCode <= 90) && // A-Z
      !(charCode >= 97 && charCode <= 122) && // a-z
      charCode !== 32 // space
    ) {
      event.preventDefault();
    }
  }

  allowUsernameCharacters(event: KeyboardEvent) {
    const char = event.key;
    if (!/^[a-zA-Z0-9._-]$/.test(char)) {
      event.preventDefault();
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
    this.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );
  }

  private setupUsernameAvailabilityCheck() {
    const usernameControl = this.profileForm.get('username');
    if (!usernameControl) return;

    this.usernameCheckSubscription = usernameControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value: string) => {
          const username = (value || '').trim();

          if (!username || usernameControl.invalid) {
            this.resetUsernameAvailabilityState();
            return of(null);
          }

          if (
            this.isEditMode &&
            this.originalUsername &&
            username.toLowerCase() === this.originalUsername.toLowerCase()
          ) {
            this.isCheckingUsername = false;
            this.isUsernameAvailable = true;
            this.clearUsernameTakenError();
            return of({ available: true });
          }

          this.isCheckingUsername = true;
          this.isUsernameAvailable = false;
          this.clearUsernameTakenError();

          return this.userProfileService.checkUsername(username).pipe(
            map((response) => ({
              available: this.isUsernameValid(response),
            })),
            catchError(() => of({ available: false }))
          );
        })
      )
      .subscribe((result) => {
        if (!result) return;
        this.isCheckingUsername = false;
        if (result.available) {
          this.isUsernameAvailable = true;
          this.clearUsernameTakenError();
          return;
        }

        this.isUsernameAvailable = false;
        usernameControl.setErrors({
          ...(usernameControl.errors || {}),
          usernameTaken: true,
        });
      });
  }

  private isUsernameValid(response: any): boolean {
    if (typeof response === 'boolean') return response;
    if (!response || typeof response !== 'object') return false;

    if (typeof response.valid === 'boolean') return response.valid;
    if (typeof response.available === 'boolean') return response.available;
    if (typeof response.exists === 'boolean') return !response.exists;

    const responseData = response.data;
    if (responseData && typeof responseData === 'object') {
      if (typeof responseData.valid === 'boolean') return responseData.valid;
      if (typeof responseData.available === 'boolean')
        return responseData.available;
      if (typeof responseData.exists === 'boolean') return !responseData.exists;
    }

    if (typeof response.success === 'boolean') return response.success;
    return false;
  }

  private clearUsernameTakenError() {
    const usernameControl = this.profileForm.get('username');
    if (!usernameControl?.errors) return;
    const { usernameTaken, ...restErrors } = usernameControl.errors;
    if (usernameTaken) {
      usernameControl.setErrors(
        Object.keys(restErrors).length ? restErrors : null
      );
    }
  }

  private resetUsernameAvailabilityState() {
    this.isCheckingUsername = false;
    this.isUsernameAvailable = false;
    this.clearUsernameTakenError();
  }
}
