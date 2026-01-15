import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../training/services/training.service';
import { ToastrService } from 'ngx-toastr';
import { LatestCertificateLayoutComponent } from '../latest-certificate-layout/latest-certificate-layout.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-verify-certificate',
  standalone: true,
  imports: [CommonModule, LatestCertificateLayoutComponent],
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.css'],
})
export class VerifyCertificateComponent implements OnInit, OnDestroy {
  @ViewChild('certificateLayout') certificateLayout?: LatestCertificateLayoutComponent;

  uniqueId: string | null = null;
  certificateData: any | null = null;
  isLoading = false;
  error?: string;
  traineePhotoUrl: string | null = null;
  private createdBlobUrls: string[] = [];

  constructor(
    private toastr: ToastrService,
    private trainingService: TrainingService,
    private route: ActivatedRoute
  ) { }

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

  ngOnDestroy(): void {
    // Cleanup blob URLs
    this.createdBlobUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch { }
    });
  }

  get totalDurationDays(): number | null {
    if (!this.certificateData?.startDate || !this.certificateData?.endDate) {
      return null;
    }
    const start = new Date(this.certificateData.startDate);
    const end = new Date(this.certificateData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diffDays = Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : null;
  }

  private async loadCertificate(): Promise<void> {
    if (!this.uniqueId) return;
    this.isLoading = true;
    this.error = undefined;
    this.trainingService
      .getCertificateDetails(this.uniqueId, '', '')
      .subscribe({
        next: async (response) => {
          const ok = response && (response.success === true || response.status === 'success' || !!response.data);
          if (ok) {
            this.certificateData = response.data || response;
            // Load trainee photo after certificate data is loaded
            await this.loadTraineePhoto();
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

  private async loadTraineePhoto(): Promise<void> {
    const photoId = this.certificateData?.traineePhotoId;
    if (typeof photoId === 'number' && photoId > 0) {
      try {
        const blob = await firstValueFrom(this.trainingService.downloadTraineeImage(photoId));
        const url = URL.createObjectURL(blob);
        this.traineePhotoUrl = url;
        this.createdBlobUrls.push(url);
        return;
      } catch (err) {
        console.warn('Failed to load trainee photo by ID:', err);
      }
    }
    // Fallback to any direct URL provided
    const imageUrl = this.certificateData?.imageUrl;
    if (imageUrl) {
      this.traineePhotoUrl = imageUrl;
    }
  }

  downloadCertificate(): void {
    if (this.certificateLayout) {
      this.certificateLayout.download();
    } else {
      this.toastr.warning('Certificate layout not ready', 'Warning');
    }
  }
}
