import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-training-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-section.component.html',
  styleUrl: './training-section.component.css'
})
export class TrainingSectionComponent {
  
  constructor(private router: Router) {}
  
  navigateToTrainingCertificate() {
    console.log('Navigating to Training Certificate Generation');
    this.router.navigate(['/training-certificate-generation']);
  }
  
  navigateToResumeCertificate() {
    console.log('Navigating to Resume Certificate Generation');
    // Implement navigation to resume certificate generation page
    // this.router.navigate(['/resume-certificate-generation']);
  }
  
  navigateToApprovedCertificates() {
    console.log('Navigating to Approved Certificates');
    this.router.navigate(['/approved-certificate']);
  }
  
  navigateToPendingApproval() {
    console.log('Navigating to Pending Approval');
    // Implement navigation to pending approval page
    // this.router.navigate(['/pending-approval']);
  }
}