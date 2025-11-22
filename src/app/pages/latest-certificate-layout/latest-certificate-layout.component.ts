import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-latest-certificate-layout',
  standalone: true,
  imports: [CommonModule, DatePipe, QRCodeComponent],
  templateUrl: './latest-certificate-layout.component.html',
  styleUrls: ['./latest-certificate-layout.component.css']
})
export class LatestCertificateLayoutComponent implements OnInit {
  @Input() data: any;
  @Input() uniqueId: string = 'UIN2025345780991';
  apiUrl = environment.apiUrl;

  @ViewChild('certificateContent', { static: false })
  certificateContent!: ElementRef;

  ngOnInit() {
    if (this.data?.trainingDate) {
      this.data.trainingDate = new Date(this.data.trainingDate);
    }
    // Trim whitespace from image URLs
    ['logoPath1','logoPath2','logoPath3'].forEach((k) => {
      if (this.data?.[k]) this.data[k] = (this.data[k] as string).trim();
    });
    if (this.data?.signatures?.length) {
      this.data.signatures = this.data.signatures.map((s: any) => ({
        ...s,
        signatorySignaturePath: s?.signatorySignaturePath?.trim()
      }));
    }
  }

  get finalUniqueId(): string {
    return this.data?.uin ?? this.uniqueId;
  }

  get qrData(): string {
    return `https://dahdtraining.ndlm.co.in/verify-certificate?uin=${this.finalUniqueId}`;
  }

  download(): void {
    const element = this.certificateContent?.nativeElement;
    if (!element) return;

    const rect = element.getBoundingClientRect();

    html2canvas(element, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      width: rect.width,
      height: rect.height,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth - 20;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      const x = (pdfWidth - imgWidth) / 2;
      let y = (pdfHeight - imgHeight) / 2;
      if (imgHeight > pdfHeight - 20) {
        y = 10;
        const newImgHeight = pdfHeight - 20;
        const newImgWidth = (imgProps.width * newImgHeight) / imgProps.height;
        pdf.addImage(imgData, 'PNG', (pdfWidth - newImgWidth) / 2, y, newImgWidth, newImgHeight);
      } else {
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      }
      pdf.save(`Certificate-${this.data?.name || 'Trainee'}.pdf`);
    });
  }
}
