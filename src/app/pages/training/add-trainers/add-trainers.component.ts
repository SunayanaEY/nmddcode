import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { AddTrainerData, RegisterDataEntryOperatorRequest } from '../../user-profile-creation/models/user-profile.model';
import { UserProfileService } from '../../user-profile-creation/services/user-profile.service';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/training-admin.service';
import { TableComponent, TableColumn } from '../../../components/table/table.component';

@Component({
  selector: 'app-add-trainers',
  imports: [ReactiveFormsModule,CommonModule,BreadcrumbComponent,TableComponent],
  templateUrl: './add-trainers.component.html',
  styleUrl: './add-trainers.component.css'
})
export class AddTrainersComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Add Trainers', url: '' },
  ];

  // Table properties
  trainersData: any[] = [];
  isTableLoading = false;
  tableColumns: TableColumn[] = [
    { key: 'trainerName', header: 'Trainer Name' },
    { key: 'mobile', header: 'Mobile' },
    { key: 'email', header: 'Email' },
    { key: 'expertiseIn', header: 'Expertise In' }
  ];

  constructor(
    private fb: FormBuilder,
    private userProfileService: UserProfileService,
    private toastr: ToastrService,
    private adminService: AdminService
  ) {
    this.profileForm = this.fb.group({
      trainerName: ['', Validators.required],
      expertiseIn: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      // password: ['', [Validators.required, Validators.minLength(8)]],
      // confirmPassword: ['', Validators.required]
    // }, { validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    this.loadTrainers();
  }

  loadTrainers() {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const currentTrainingHeadId = userData.trainingHeadId;

    if (currentTrainingHeadId) {
      this.isTableLoading = true;
      this.adminService.getTrainersByTrainingHead(currentTrainingHeadId).subscribe({
        next: (response) => {
          this.isTableLoading = false;
          if (response.success) {
            this.trainersData = response.data;
          } else {
            this.toastr.error(response.message || 'Failed to load trainers', 'Error');
          }
        },
        error: (error) => {
          this.isTableLoading = false;
          const errorMessage = error.error?.message || 'An error occurred while loading trainers';
          this.toastr.error(errorMessage, 'Error');
          console.error('Load trainers error:', error);
        }
      });
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;

      // Get trainingHeadId from session storage
      const sessionData = sessionStorage.getItem('user');
      let trainingHeadId = '';

      // if (sessionData) {
      //   try {
      //     const userData = JSON.parse(sessionData);
      //     trainingHeadId = userData.trainingHeadId || '';
      //   } catch (error) {
      //     console.error('Error parsing session data:', error);
      //     this.toastr.error('Session data error. Please login again.', 'Error');
      //     this.isLoading = false;
      //     return;
      //   }
      // }

      // if (!trainingHeadId) {
      //   this.toastr.error('Training Head ID not found. Please login again.', 'Error');
      //   this.isLoading = false;
      //   return;
      // }
      const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
      const  currentTrainingHeadId =userData.trainingHeadId;

      const formData: AddTrainerData = {
        trainerName: this.profileForm.value.trainerName,
        mobile: this.profileForm.value.mobile,
        email: this.profileForm.value.email,
        expertiseIn: this.profileForm.value.expertiseIn,
        trainingHeadId: currentTrainingHeadId
      };

      this.adminService.addTrainer(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastr.success(response.message || 'Trainer registered successfully!', 'Success');
            this.profileForm.reset();
            this.loadTrainers(); // Reload the trainers table
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
