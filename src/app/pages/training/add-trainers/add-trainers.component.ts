import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import { AddTrainerData } from '../../user-profile-creation/models/user-profile.model';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/training-admin.service';
import {
  TableComponent,
  TableColumn,
} from '../../../components/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-trainers',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    BreadcrumbComponent,
    TableComponent,
    TranslateModule,
  ],
  templateUrl: './add-trainers.component.html',
  styleUrl: './add-trainers.component.css',
})
export class AddTrainersComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;

  isEditMode = false;
  editingTrainerId: string | null = null;

  showRegistrationForm = false;

  trainersData: any[] = [];
  isTableLoading = false;

  tableColumns: TableColumn[] = [
    { key: 'trainerName', header: 'Trainer Name' },
    { key: 'mobile', header: 'Contact Number' },
    { key: 'email', header: 'Email' },
    { key: 'expertiseIn', header: 'Expertise In' },
  ];

  tableActions = [
    { name: 'edit', icon: 'bi bi-pencil', class: 'btn-info', title: 'Edit' },
    {
      name: 'delete',
      icon: 'bi bi-trash',
      class: 'btn-danger',
      title: 'Delete',
    },
  ];

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/admin/role-dashboard' },
    { label: 'Add Trainers', url: '' },
  ];

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private adminService: AdminService
  ) {
    this.profileForm = this.fb.group({
      trainerName: ['', Validators.required],
      expertiseIn: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit() {
    this.loadTrainers();
  }

  // ✅ LOAD TABLE
  loadTrainers() {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const trainingHeadId = userData.trainingHeadId;
    if (!trainingHeadId) return;

    this.isTableLoading = true;

    this.adminService.getTrainersByTrainingHead(trainingHeadId).subscribe({
      next: (response) => {
        this.isTableLoading = false;
        if (response.success) {
          this.trainersData = response.data;
        } else {
          this.toastr.error('Failed to load trainers');
        }
      },
      error: () => {
        this.isTableLoading = false;
        this.toastr.error('Server error');
      },
    });
  }

  onActionClick(event: { action: string; item: any; index: number }) {
    if (event.action === 'edit') {
      this.onEditTrainer(event.item);
    }

    if (event.action === 'delete') {
      this.onDeleteTrainer(event.item);
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isLoading = true;

    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const trainingHeadId = userData.trainingHeadId;

    const formData: AddTrainerData = {
      trainerName: this.profileForm.value.trainerName,
      mobile: this.profileForm.value.mobile,
      email: this.profileForm.value.email,
      expertiseIn: this.profileForm.value.expertiseIn,
      trainingHeadId,
    };

    if (this.isEditMode && this.editingTrainerId) {
      this.adminService
        .updateTrainer(this.editingTrainerId, formData)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.status === 200) {
              this.toastr.success('Trainer updated successfully');
              this.resetForm();
              this.loadTrainers();
            }
          },
          error: () => {
            this.isLoading = false;
            this.toastr.error('Update failed');
          },
        });
    } else {
      this.adminService.addTrainer(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastr.success('Trainer added successfully');
            this.resetForm();
            this.loadTrainers();
          }
        },
        error: () => {
          this.isLoading = false;
          this.toastr.error('Creation failed');
        },
      });
    }
  }

  onEditTrainer(rowData: any) {
    this.isEditMode = true;
    this.showRegistrationForm = true;
    this.editingTrainerId = rowData.id;

    this.profileForm.patchValue({
      trainerName: rowData.trainerName,
      expertiseIn: rowData.expertiseIn,
      mobile: rowData.mobile,
      email: rowData.email,
    });

    setTimeout(() => {
      document.querySelector('.registration-form-section')?.scrollIntoView({
        behavior: 'smooth',
      });
    }, 100);
  }

  onDeleteTrainer(rowData: any) {
    if (!confirm(`Delete ${rowData.trainerName}?`)) return;

    this.adminService.deleteTrainer(rowData.id).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.toastr.success('Trainer deleted');
          this.loadTrainers();
        }
      },
      error: () => {
        this.toastr.error('Delete failed');
      },
    });
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

  resetForm() {
    this.profileForm.reset();
    this.showRegistrationForm = false;
    this.isEditMode = false;
    this.editingTrainerId = null;
  }

  toggleRegistrationForm() {
    this.showRegistrationForm = !this.showRegistrationForm;
    if (!this.showRegistrationForm) {
      this.resetForm();
    }
  }
}
