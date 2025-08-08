import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-certificate-layout',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './certificate-layout.component.html',
  styleUrls: ['./certificate-layout.component.css'],
})
export class CertificateLayoutComponent {
  @Input() data: any; // ✅ changed from trainee to data
  @Input() uniqueId: string = 'UIN2025345780991';

  @ViewChild('certificateContent', { static: false })
  certificateContent!: ElementRef;

  get qrData(): string {
    return `https://yourdomain.com/verify/${this.uniqueId}`;
  }

  // To be called from parent or modal controller if needed
  closeModal(): void {
    console.log('Close modal');
  }

  download(): void {
    html2canvas(this.certificateContent.nativeElement).then((canvas) => {
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
