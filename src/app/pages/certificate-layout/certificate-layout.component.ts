import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TrainingService } from '../training/services/training.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-certificate-layout',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './certificate-layout.component.html',
  styleUrls: ['./certificate-layout.component.css'],
})
export class CertificateLayoutComponent implements OnInit {
  @Input() data: any;
  @Input() uniqueId: string = 'UIN2025345780991';
  apiUrl = environment.apiUrl;
  

  @ViewChild('certificateContent', { static: false })
  certificateContent!: ElementRef;
  constructor(
    private toastr: ToastrService,
    private trainingService: TrainingService
  ) {}
  ngOnInit() {
    // alert(JSON.stringify(this.data));
    
    // Trim whitespace from image URLs
    if (this.data.logoPath1) {
      this.data.logoPath1 = this.data.logoPath1.trim();
    }
    if (this.data.logoPath2) {
      this.data.logoPath2 = this.data.logoPath2.trim();
    }
    if (this.data.logoPath3) {
      this.data.logoPath3 = this.data.logoPath3.trim();
    }
    
    // Trim whitespace from signature image URLs
    if (this.data.signatures && this.data.signatures.length > 0) {
      this.data.signatures.forEach((signature: any) => {
        if (signature.signatorySignaturePath) {
          signature.signatorySignaturePath = signature.signatorySignaturePath.trim();
        }
      });
    }
  }

  get finalUniqueId(): string {
    return this.data?.uin ?? this.uniqueId;
  }

  // get qrData(): string {
  //   return `https://yourdomain.com/verify/${this.uniqueId}`;
  // }
  get qrData(): string {
    // Direct API URL for verification
    return `https://dahdtraining.ndlm.co.in/verify-certificate?uin=${this.finalUniqueId}`;
  }

  // To be called from parent or modal controller if needed
  closeModal(): void {}

  download(): void {
    html2canvas(this.certificateContent.nativeElement, {
      useCORS: true, // allow cross-origin images
      allowTaint: false, // don't allow tainted canvas
      scale: 2, // better quality
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate-${this.data?.traineeName || 'Trainee'}.pdf`);
    });
  }
}
