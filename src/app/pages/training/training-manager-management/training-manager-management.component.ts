import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';
import { UserProfileCreationComponent } from '../../user-profile-creation/user-profile-creation.component';
import { RegisteredDataEntryOperatorsComponent } from '../registered-data-entry-operators/registered-data-entry-operators.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-training-manager-management',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    UserProfileCreationComponent,
    RegisteredDataEntryOperatorsComponent,
    TranslateModule,
  ],
  templateUrl: './training-manager-management.component.html',
  styleUrls: ['./training-manager-management.component.css'],
})
export class TrainingManagerManagementComponent implements OnInit {
  @ViewChild(UserProfileCreationComponent)
  formComponent!: UserProfileCreationComponent;

  // ViewChild to access the table component
  @ViewChild(RegisteredDataEntryOperatorsComponent)
  tableComponent!: RegisteredDataEntryOperatorsComponent;

  // Form visibility control
  showRegistrationForm = false;

  // Breadcrumb configuration
  breadcrumbItems = [
    { label: 'Dashboard', url: '/admin/role-dashboard' },
    { label: 'Training Manager Management', url: '' },
  ];

  constructor() {}

  ngOnInit(): void {
    console.log('Training Manager Management component initialized');
  }

  /**
   * Toggle the visibility of the registration form
   */
  toggleRegistrationForm(): void {
    this.showRegistrationForm = !this.showRegistrationForm;
  }
  onEditFromTable(rowData: any): void {
    this.showRegistrationForm = true;

    setTimeout(() => {
      if (this.formComponent) {
        this.formComponent.setEditData(rowData);
      }

      const formElement = document.getElementById('formSection');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Show the registration form
   */
  showForm(): void {
    this.showRegistrationForm = true;
  }

  /**
   * Hide the registration form
   */
  hideForm(): void {
    this.showRegistrationForm = false;
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
    // Hide the form after successful submission
    this.hideForm();
  }
}
