import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // ✅ import CommonModule + DatePipe
import { QRCodeComponent } from 'angularx-qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TrainingService } from '../training/services/training.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-certificate-layout',
  standalone: true,
  imports: [CommonModule, DatePipe, QRCodeComponent],
  templateUrl: './new-certificate-layout.component.html',
  styleUrls: ['./new-certificate-layout.component.css'],
})
export class NewCertificateLayoutComponent implements OnInit {
  @Input() data: any;
  @Input() uniqueId: string = 'UIN2025345780991';
  instituteDetails: any;

  @ViewChild('certificateContent', { static: false })
  certificateContent!: ElementRef;

  constructor(
    private toastr: ToastrService,
    private trainingService: TrainingService
  ) {}

  ngOnInit() {
    console.log(this.data);
    this.data.trainingDate = new Date(this.data.trainingDate);
    
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
    
    this.getInstituteDetails(this.data.trainingInstituteId);
  }

  get finalUniqueId(): string {
    return this.data?.uin ?? this.uniqueId;
  }

  get qrData(): string {
    return `http://localhost:4200/verify-certificate?uin=${this.finalUniqueId}`;
  }

  closeModal(): void {}

  getInstituteDetails(trainingInstituteId: any) {
    this.trainingService.getInstituteDetails(trainingInstituteId).subscribe({
      next: (res) => {
        this.instituteDetails = res.data;
      },
      error: (err) => {
        console.error('Error fetching institute details:', err);
      },
    });
  }

  download(): void {
    const element = this.certificateContent.nativeElement;

    // Get the actual dimensions of the certificate
    const rect = element.getBoundingClientRect();

    html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 2, // Higher quality
      width: rect.width,
      height: rect.height,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      backgroundColor: '#ffffff',
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        // Create PDF with proper dimensions
        const pdf = new jsPDF('portrait', 'mm', 'a4'); // Changed to portrait

        // A4 dimensions in mm
        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

        // Calculate image dimensions to fit A4
        const imgProps = pdf.getImageProperties(imgData);
        const imgWidth = pdfWidth - 20; // 20mm margin
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        // Center the image on the page
        const x = (pdfWidth - imgWidth) / 2;
        let y = (pdfHeight - imgHeight) / 2;

        // If image is too tall, start from top with margin
        if (imgHeight > pdfHeight - 20) {
          y = 10; // 10mm from top
          const newImgHeight = pdfHeight - 20; // 20mm total margin
          const newImgWidth = (imgProps.width * newImgHeight) / imgProps.height;
          pdf.addImage(
            imgData,
            'PNG',
            (pdfWidth - newImgWidth) / 2,
            y,
            newImgWidth,
            newImgHeight
          );
        } else {
          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        }

        pdf.save(`Certificate-${this.data?.name || 'Trainee'}.pdf`);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        this.toastr.error('Failed to generate PDF. Please try again.');
      });
  }
}
