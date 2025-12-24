import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingCentreAdminProfileComponent } from '../training-centre-admin-profile/training-centre-admin-profile.component';
import { TrainingCentreComponent } from '../training-centre/training-centre.component';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-training-institute-management',
  standalone: true,
  imports: [
    CommonModule,
    TrainingCentreAdminProfileComponent,
    TrainingCentreComponent,
    BreadcrumbComponent,
    TranslateModule
  ],
  templateUrl: './training-institute-management.component.html',
  styleUrls: ['./training-institute-management.component.css']
})
export class TrainingInstituteManagementComponent implements OnInit {

  // ViewChild reference to the table component
  @ViewChild(TrainingCentreComponent) trainingCentreComponent!: TrainingCentreComponent;

  // Breadcrumb configuration
  breadcrumbItems = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Training Institute Management', link: '', active: true }
  ];

  // Form visibility state
  showForm: boolean = false;

  constructor() { }

  ngOnInit(): void {
    console.log('Training Institute Management component initialized');
  }

  /**
   * Toggle the visibility of the training institute form
   */
  toggleForm(): void {
    // this.showForm = !this.showForm;
    this.showForm = true;
  }

  /**
   * Handle form submission event from the training centre admin profile component
   * This method will refresh the table data and hide the form
   */
  onFormSubmitted(): void {
    // Refresh the table data
    if (this.trainingCentreComponent) {
      this.trainingCentreComponent.loadTrainingInstitutes();
    }
    
    // Hide the form after successful submission
    this.showForm = false;
  }

  /**
   * Check if user has role 1 (from session storage)
   */
  isRole1User(): boolean {
    const roleId = sessionStorage.getItem('user');
    if (roleId) {
      try {
        const userData = JSON.parse(roleId);
        return userData.role === 1; 
      } catch (e) {
        return false;
      }
    }
    return false;
  }
  isRole6User(): boolean {
    const roleId = sessionStorage.getItem('user');
    if (roleId) {
      try {
        const userData = JSON.parse(roleId);
        return userData.role === 6; 
      } catch (e) {
        return false;
      }
    }
    return false;
  }

}