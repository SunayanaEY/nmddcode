import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableComponent, TableColumn, TableAction } from '../../../components/table/table.component';

interface Participant {
  name: string;
  age: number;
  gender: string;
  contactNumber: string;
  aadhar: string;
  email: string;
}

@Component({
  selector: 'app-manual-training-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent, TableComponent],
  templateUrl: './manual-training-upload.component.html',
  styleUrl: './manual-training-upload.component.css'
})
export class ManualTrainingUploadComponent implements OnInit {
  participantForm!: FormGroup;
  participants: Participant[] = [];
  editingIndex: number = -1;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Institute Login', url: '/training-module' },
    { label: 'Training Certificate generation', url: '/training-certificate-generation' },
    { label: 'Manual Training Upload' }
  ];
  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
    { key: 'gender', header: 'Gender' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'aadhar', header: 'Aadhar (Masked)' },
    { key: 'email', header: 'Email(Optional)' }
  ];
  tableActions: TableAction[] = [
    { name: 'edit', icon: 'bi-pencil', class: 'btn-edit', title: 'Edit' },
    { name: 'delete', icon: 'bi-trash', class: 'btn-delete', title: 'Delete' },
    { name: 'view', icon: 'bi-eye', class: 'btn-view', title: 'View' }
  ];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.initializeForm();
    this.loadSampleData();
  }

  ngOnInit(): void {
  }

  initializeForm(): void {
    this.participantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      gender: ['', Validators.required],
      contactNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      aadhar: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      email: ['', [Validators.email]]
    });
  }

  loadSampleData(): void {
    this.participants = [
      {
        name: 'Manoj Kumar',
        age: 25,
        gender: 'Male',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Suman Devi',
        age: 23,
        gender: 'Female',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Manoj Kumar',
        age: 25,
        gender: 'Male',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Suman Devi',
        age: 23,
        gender: 'Female',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Manoj Kumar',
        age: 25,
        gender: 'Male',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Suman Devi',
        age: 23,
        gender: 'Female',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Manoj Kumar',
        age: 25,
        gender: 'Male',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Suman Devi',
        age: 23,
        gender: 'Female',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Manoj Kumar',
        age: 25,
        gender: 'Male',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      },
      {
        name: 'Suman Devi',
        age: 23,
        gender: 'Female',
        contactNumber: 'xxxxxx6484',
        aadhar: '4356xxxxxx32',
        email: 'xxxx@gmail.com'
      }
    ];
  }

  openAddModal(): void {
    this.editingIndex = -1;
    this.participantForm.reset();
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
        aadhar: this.maskAadhar(formValue.aadhar),
        email: this.maskEmail(formValue.email)
      };

      if (this.editingIndex >= 0) {
        this.participants[this.editingIndex] = participant;
      } else {
        this.participants.push(participant);
      }

      this.closeModal();
      this.participantForm.reset();
    }
  }

  handleTableAction(event: { action: string, item: any, index: number }): void {
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
    this.participantForm.patchValue({
      name: participant.name,
      age: participant.age,
      gender: participant.gender,
      contactNumber: '9876543210', // Original unmasked value
      aadhar: '123456789012', // Original unmasked value
      email: participant.email.includes('xxxx') ? 'user@example.com' : participant.email
    });

    this.openAddModal();
  }

  deleteParticipant(index: number): void {
    if (confirm('Are you sure you want to delete this participant?')) {
      this.participants.splice(index, 1);
    }
  }

  viewParticipant(index: number): void {
    const participant = this.participants[index];
    alert(`Participant Details:\n\nName: ${participant.name}\nAge: ${participant.age}\nGender: ${participant.gender}\nContact: ${participant.contactNumber}\nAadhar: ${participant.aadhar}\nEmail: ${participant.email}`);
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
    if (contact && contact.length >= 6) {
      return 'xxxxxx' + contact.slice(-4);
    }
    return contact;
  }

  private maskAadhar(aadhar: string): string {
    if (aadhar && aadhar.length >= 8) {
      return aadhar.slice(0, 4) + 'xxxxxx' + aadhar.slice(-2);
    }
    return aadhar;
  }

  private maskEmail(email: string): string {
    if (email && email.includes('@')) {
      const [username, domain] = email.split('@');
      return 'xxxx@' + domain;
    }
    return email;
  }

  // Helper method for template
  formatSerialNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
