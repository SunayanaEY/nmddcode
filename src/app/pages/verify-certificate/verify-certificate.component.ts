import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingService } from '../training/services/training.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-verify-certificate',
  templateUrl: './verify-certificate.component.html',
  styleUrls: ['./verify-certificate.component.css'],
})
export class VerifyCertificateComponent implements OnInit {
  uniqueId: string | null = null;

  constructor(
    private toastr: ToastrService,
    private trainingService: TrainingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.uniqueId = params['uin'] || null;
      console.log('Extracted UIN:', this.uniqueId);
    });
    this.getQrData();
  }
  ngAfterViewInit() {
    const modalElement = document.querySelector('.modal') as any;
    if (modalElement) {
      // Bootstrap 5 modal initialization
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  getQrData() {
    if (!this.uniqueId) {
      this.toastr.error('No UIN found in URL', 'Error');
      return;
    }
    this.trainingService.verifyCertificate(this.uniqueId).subscribe({
      next: (res) => {
        this.toastr.success('Certificate Verified Successfully!');
      },
      error: (err) => {
        this.toastr.error(
          'Failed to Verify Certificate. Please try again.',
          'Error'
        );
        console.error('QR API Error:', err);
      },
    });
  }
}
