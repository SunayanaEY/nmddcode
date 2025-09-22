import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-training-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-section.component.html',
  styleUrl: './training-section.component.css',
})
export class TrainingSectionComponent implements OnInit {
  userRole: number = 0;
  certificateTitle: string = ''; // Add this property

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userRole = user.role;
      
      // Set certificate title based on user role
      if (this.userRole === 4) {
        this.certificateTitle = 'All Trainings';
      } else {
        this.certificateTitle = 'Approve and Reject Trainings';
      }
    }
  }

  navigateToTrainingCertificate() {
    console.log('Navigating to Schedule Training');
    this.router.navigate(['/admin/training-certificate-generation']);
    this.router.navigate(['/admin/training-certificate-generation']);
  }

  navigateToResumeCertificate() {
    console.log('Navigating to Resume Certificate Generation');
    // Implement navigation to resume certificate generation page
    // this.router.navigate(['/resume-certificate-generation']);
  }

  navigateToApprovedCertificates() {
    console.log('Navigating to Approved Certificates');
    this.router.navigate(['/admin/approvedrejectedTrainings']);
    // this.router.navigate(['/admin/approved-certificate']);
  }
  navigateToVerifyTrainings() {
    console.log('Navigating to Approved Certificates');
    this.router.navigate(['/admin/verifyTrainings']);
  }

  navigateToAllTrainings() {
    console.log('Navigating to Approved Certificates');
    // this.router.navigate(['/admin/all-trainings-admin']);
    this.router.navigate(['/admin/all-trainings']);
  }
  navigateToAllTrainingsAdmin() {
    console.log('Navigating to Approved Certificates');
    this.router.navigate(['/admin/all-trainings-admin']);
    // this.router.navigate(['/admin/all-trainings']);
  }
  navigateToActivityLog(): void {
    this.router.navigate(['/admin/activity-log']);
  }

  navigateToPendingApproval() {
    console.log('Navigating to Pending Approval');
    // Implement navigation to pending approval page
    // this.router.navigate(['/pending-approval']);
  }

  navigateToCertificateApproval() {
    this.router.navigate(['/admin/all-trainings-admin']);
    // this.router.navigate(['/admin/certificate-approval']);
  }
  navigateToCertificateAll() {
    this.router.navigate(['/admin/All-Trainings']);
  }

  navigateToSchemeManagementMaster() {
    this.router.navigate(['/admin/scheme-management']);
  }

  navigateToTrainingTypeManagement() {
    this.router.navigate(['/admin/training-type-management']);
  }
  navigateToUserProfileCreation() {
    this.router.navigate(['/admin/user-profile-creation']);
  }

  navigateToRegisteredDataEntryOperators(): void {
    this.router.navigate(['/admin/registered-data-entry-operators']);
  }

  navigateToAddTrainers(): void {
    this.router.navigate(['/admin/add-trainers']);
  }

  navigateToTrainingCentre() {
    this.router.navigate(['/admin/training-centre']);
  }

  navigateToTrainingCentreAdminProfile() {
    this.router.navigate(['/admin/training-centre-admin-profile']);
  }
}
