import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingCentreAdminProfileComponent } from '../training-centre-admin-profile/training-centre-admin-profile.component';
import { TrainingCentreComponent } from '../training-centre/training-centre.component';
import { BreadcrumbComponent } from '../../../components/breadcrumb/breadcrumb.component';

@Component({
  selector: 'app-training-institute-management',
  standalone: true,
  imports: [
    CommonModule,
    TrainingCentreAdminProfileComponent,
    TrainingCentreComponent,
    BreadcrumbComponent
  ],
  templateUrl: './training-institute-management.component.html',
  styleUrls: ['./training-institute-management.component.css']
})
export class TrainingInstituteManagementComponent implements OnInit {

  // Breadcrumb configuration
  breadcrumbItems = [
    { label: 'Dashboard', link: '/admin/dashboard' },
    { label: 'Training Management', link: '/admin/training' },
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
    this.showForm = !this.showForm;
  }

}