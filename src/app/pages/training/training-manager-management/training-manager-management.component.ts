import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';
import { UserProfileCreationComponent } from '../../user-profile-creation/user-profile-creation.component';
import { RegisteredDataEntryOperatorsComponent } from '../registered-data-entry-operators/registered-data-entry-operators.component';

@Component({
  selector: 'app-training-manager-management',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    UserProfileCreationComponent,
    RegisteredDataEntryOperatorsComponent
  ],
  templateUrl: './training-manager-management.component.html',
  styleUrls: ['./training-manager-management.component.css']
})
export class TrainingManagerManagementComponent implements OnInit {

  // ViewChild to access the table component
  @ViewChild(RegisteredDataEntryOperatorsComponent) tableComponent!: RegisteredDataEntryOperatorsComponent;

  // Breadcrumb configuration
  breadcrumbItems = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Manager Management', url: '' }
  ];

  constructor() { }

  ngOnInit(): void {
    console.log('Training Manager Management component initialized');
  }

  /**
   * Handle form submission success event from user profile creation component
   */
  onFormSubmissionSuccess(): void {
    console.log('Form submitted successfully, refreshing table data...');
    // Refresh the table data when form is submitted successfully
    if (this.tableComponent) {
      this.tableComponent.loadDataEntryOperators();
    }
  }
}