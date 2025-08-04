import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-training-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-section.component.html',
  styleUrl: './training-section.component.css'
})
export class TrainingSectionComponent implements OnInit {
  userRole: number = 0;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userRole = user.role;
    }
  }

  navigateToTrainingCertificate() {
    console.log('Navigating to Training Certificate Generation');
    this.router.navigate(['/dashboard/training-certificate-generation']);
  }

  navigateToResumeCertificate() {
    console.log('Navigating to Resume Certificate Generation');
    // Implement navigation to resume certificate generation page
    // this.router.navigate(['/resume-certificate-generation']);
  }

  navigateToApprovedCertificates() {
    console.log('Navigating to Approved Certificates');
    this.router.navigate(['/dashboard/approved-certificate']);
  }

  navigateToAllTrainings() {
    console.log('Navigating to Approved Certificates');
    this.router.navigate(['/dashboard/all-trainings']);
  }


  navigateToPendingApproval() {
    console.log('Navigating to Pending Approval');
    // Implement navigation to pending approval page
    // this.router.navigate(['/pending-approval']);
  }

  navigateToCertificateApproval() {
    this.router.navigate(['/dashboard/certificate-approval']);
  }

  navigateToUserProfileCreation() {
    this.router.navigate(['/dashboard/user-profile-creation']);
  }

  navigateToTrainingCentre() {
    this.router.navigate(['/dashboard/training-centre']);
  }
}
