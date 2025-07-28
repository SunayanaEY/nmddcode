import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-user-profile-creation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, BreadcrumbComponent],
  templateUrl: './user-profile-creation.component.html',
  styleUrls: ['./user-profile-creation.component.css'],
})
export class UserProfileCreationComponent {
  profileForm: FormGroup;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/dashboard/training-module' },
    { label: 'User Profile', url: '' },
  ];

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      instituteName: [
        '',
        Validators.required,
      ],
      scheme: ['', Validators.required],
      state: ['', Validators.required],
      district: ['', Validators.required],
      block: ['', Validators.required],
      registrationId: [''],
      contactPersonName: ['', Validators.required],
      designation: ['', Validators.required],
      contactNumber: ['', [Validators.required]],
      emailId: ['', [Validators.required, Validators.email]],
    });
  }
}