import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../training/services/training.service';
import { ToastrService } from 'ngx-toastr';
import { LatestCertificateLayoutComponent } from '../latest-certificate-layout/latest-certificate-layout.component';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule, LatestCertificateLayoutComponent],
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.css'],
})
export class VerifyCertificateComponent implements OnInit {
  uniqueId: string | null = null;
  certificateData: any | null = null;
  isLoading = false;
  error?: string;

  constructor(
    private toastr: ToastrService,
    private trainingService: TrainingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.uniqueId = params['uin'] || null;
      if (!this.uniqueId) {
        this.error = 'No UIN found in URL';
        this.toastr.error(this.error, 'Error');
        return;
      }
      this.loadCertificate();
    });
  }

  private loadCertificate(): void {
    if (!this.uniqueId) return;
    this.isLoading = true;
    this.error = undefined;
    this.trainingService
      .getCertificateDetails(this.uniqueId, '', '')
      .subscribe({
        next: (response) => {
          const ok = response && (response.success === true || response.status === 'success' || !!response.data);
          if (ok) {
            this.certificateData = response.data || response;
          } else {
            this.error = response?.message || 'Certificate details not found';
            this.toastr.error(this.error, 'Error');
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.error = err?.error?.message || 'Failed to load certificate details';
          this.toastr.error(this.error, 'Error');
          console.error('Load certificate error:', err);
        },
      });
  }
}
