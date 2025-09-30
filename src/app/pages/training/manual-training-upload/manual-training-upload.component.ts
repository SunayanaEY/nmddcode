import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../../components/table/table.component';
import { TrainingService } from '../../../pages/training/services/training.service';

interface Participant {
  name: string;
  age: number;
  gender: string;
  contactNumber: string;
  fatherName: string;
  email: string;
  dob: Date;
}

@Component({
  selector: 'app-manual-training-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    TableComponent,
  ],
  templateUrl: './manual-training-upload.component.html',
  styleUrl: './manual-training-upload.component.css',
})
export class ManualTrainingUploadComponent implements OnInit {
  participantForm!: FormGroup;
  participants: Participant[] = [];
  editingIndex: number = -1;
  alphabetError: boolean = false;
  // aadharError: boolean = false;
  emailError: boolean = false;
  selectedParticipant: Participant | null = null;
  isSpinning: boolean = false;
  trainingDetails: any = null;
  trainingId: any;
  trainingManagerId: any;
  trainingInstituteId: any;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    {
      label: 'Schedule Training',
      url: '/admin/training-certificate-generation',
    },
    { label: 'Manual Training Upload' },
  ];
  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
    { key: 'gender', header: 'Gender' },
    { key: 'dob', header: 'DOB' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'fatherName', header: "Father's Name" },
    { key: 'email', header: 'Email(Optional)' },
  ];
  tableActions: TableAction[] = [
    { name: 'edit', icon: 'bi-pencil', class: 'btn-edit', title: 'Edit' },
    { name: 'delete', icon: 'bi-trash', class: 'btn-delete', title: 'Delete' },
    { name: 'view', icon: 'bi-eye', class: 'btn-view', title: 'View' },
  ];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private trainingService: TrainingService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get query params from snapshot (one-time read)
    this.trainingId = this.route.snapshot.queryParams['trainingId'];
    this.getTrainingInstituteId();
    // this.getTrainingManagerId();
    // Apply delay if needed
    this.getTrainingDetails(this.trainingId);
  }
  getTrainingInstituteId() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.trainingInstituteId = user.trainingHeadId;
    }
  }
  getTrainingManagerId() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.trainingManagerId = user.trainingManagerId;
    }
  }

  // loadTrainingDetails() {
  //   this.route.queryParams.subscribe((params) => {
  //     this.trainingId = params['trainingId'];
  //   });
  //   alert(this.trainingId);
  //   this.getTrainingDetails(this.trainingId);
  // }

  initializeForm(): void {
    this.participantForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      age: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(120),
          Validators.pattern(/^[0-9]+$/),
        ],
      ],
      gender: ['', Validators.required],
      contactNumber: [
        '',
        [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)],
      ],
      fatherName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      email: ['', [Validators.email]],
      dob: ['', [Validators.required, this.dateValidator]],
    });
  }

  getTrainingDetails(trainingId: number) {
    // alert('Training Upload : ' + trainingId);
    this.isSpinning = true;
    this.trainingService.getTrainingDetails(trainingId).subscribe({
      next: (response) => {
        this.isSpinning = false;
        console.log(response);
        this.trainingDetails = response;
      },
      error: (error) => {
        this.isSpinning = false;
      },
    });
  }

  openAddModal(isEdit: boolean): void {
    if (!isEdit) {
      this.editingIndex = -1;
      this.participantForm.reset();
    }

    const modalElement = document.getElementById('addParticipantModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  addParticipant(): void {
    if (this.participantForm.valid) {
      const formValue = this.participantForm.value;

      // Mask sensitive data for display
      const participant: Participant = {
        name: formValue.name,
        age: formValue.age,
        gender: formValue.gender,
        contactNumber: this.maskContactNumber(formValue.contactNumber),
        fatherName: formValue.fatherName,
        email: this.maskEmail(formValue.email),
        dob: formValue.dob,
      };

      this.participants.push(participant);

      this.closeModal();
      this.participantForm.reset();
      this.toastr.success('Participant added successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      this.participantForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields correctly!');
    }
  }
  //update participant
  updateParticipant(): void {
    if (this.participantForm.valid && this.editingIndex >= 0) {
      const formValue = this.participantForm.value;

      const updatedParticipant: Participant = {
        name: formValue.name,
        age: formValue.age,
        gender: formValue.gender,
        contactNumber: this.maskContactNumber(formValue.contactNumber),
        fatherName: formValue.fatherName,
        email: this.maskEmail(formValue.email),
        dob: formValue.dob,
      };

      this.participants[this.editingIndex] = updatedParticipant;
      this.editingIndex = -1;

      this.closeModal();
      this.participantForm.reset();
      this.toastr.success('Participant updated successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      this.participantForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields correctly!');
    }
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      this.alphabetError = true;
      event.preventDefault();
    } else {
      this.alphabetError = false;
    }
  }
  // allowOnlyAadharDigits(event: KeyboardEvent): void {
  //   const charCode = event.which ? event.which : event.keyCode;
  //   if (charCode < 48 || charCode > 57) {
  //     this.aadharError = true;
  //     setTimeout(() => (this.aadharError = false), 1000); // Auto-hide in 1 sec
  //     event.preventDefault();
  //   }
  // }
  validateEmail(): void {
    const emailControl = this.participantForm.get('email');
    const emailValue = emailControl?.value || '';

    // Basic email format check (Angular already checks but we're adding real-time UX)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailValue && !emailRegex.test(emailValue)) {
      this.emailError = true;
    } else {
      this.emailError = false;
    }
  }

  handleTableAction(event: { action: string; item: any; index: number }): void {
    switch (event.action) {
      case 'edit':
        this.editParticipant(event.index);
        break;
      case 'delete':
        this.deleteParticipant(event.index);
        break;
      case 'view':
        this.viewParticipant(event.index);
        break;
    }
  }

  editParticipant(index: number): void {
    this.editingIndex = index;
    const participant = this.participants[index];

    // For editing, we would need to unmask the data or store original values
    // For demo purposes, using placeholder values
    this.openAddModal(true);

    this.participantForm.patchValue({
      name: participant.name,
      age: participant.age,
      dob: participant.dob,
      gender: participant.gender,
      contactNumber: participant.contactNumber, // Original unmasked value
      fatherName: participant.fatherName, // Original unmasked value
      email: participant.email.includes('xxxx')
        ? 'user@example.com'
        : participant.email,
    });
  }

  deleteParticipant(index: number): void {
    if (confirm('Are you sure you want to delete this participant?')) {
      this.participants.splice(index, 1);
    }
  }

  viewParticipant(index: number): void {
    this.selectedParticipant = this.participants[index];
    const modalElement = document.getElementById('viewParticipantModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  submitTraineesData() {
    const trainingId = this.trainingId;
    const trainingInstituteId = this.trainingInstituteId;
    const payload = this.participants.map((participant) => ({
      ...participant,
      trainingId: trainingId,
      trainingInstituteId: trainingInstituteId,
    }));

    this.isSpinning = true;

    this.trainingService.submitTrainees(payload).subscribe({
      next: (response) => {
        this.isSpinning = false;
        this.toastr.success('Participants submitted successfully!', 'Success');
      },
      error: (error) => {
        this.isSpinning = false;
        this.toastr.error('Failed to submit participants.', 'Error');
      },
    });
  }

  private closeModal(): void {
    const modalElement = document.getElementById('addParticipantModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  private maskContactNumber(contact: string): string {
    // if (contact && contact.length >= 6) {
    //   return 'xxxxxx' + contact.slice(-4);
    // }
    return contact;
  }

  // private maskAadhar(aadhar: string): string {
  //   if (aadhar && aadhar.length >= 8) {
  //     return aadhar.slice(0, 4) + 'xxxxxx' + aadhar.slice(-2);
  //   }
  //   return aadhar;
  // }

  private maskEmail(email: string): string {
    // if (email && email.includes('@')) {
    //   const [username, domain] = email.split('@');
    //   return 'xxxx@' + domain;
    // }
    return email;
  }

  // Helper method for template
  formatSerialNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  // Custom date validator
  dateValidator(control: any) {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120); // 120 years ago

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    minDate.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { futureDate: true };
    }

    if (selectedDate < minDate) {
      return { tooOld: true };
    }

    return null;
  }
}
