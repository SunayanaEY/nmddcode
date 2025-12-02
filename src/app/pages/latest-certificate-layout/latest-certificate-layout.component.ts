import { Component, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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

  // Blob-based display URLs for logos and signatures
  logo1Url: string | null = null;
  logo2Url: string | null = null;
  logo3Url: string | null = null;
  signatureUrls: (string | null)[] = [];
  private createdBlobUrls: string[] = [];

  constructor(private http: HttpClient) {}

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
    // Build blob-based display URLs for logos and signatures
    this.prepareAssetUrls();
  }

  get finalUniqueId(): string {
    return this.data?.uin ?? this.uniqueId;
  }

  get qrData(): string {
    return `https://dahdtraining.ndlm.co.in/verify-certificate?uin=${this.finalUniqueId}`;
  }

  // Determine a valid trainee photo URL from possible API fields
  get validPhotoUrl(): string | null {
    const candidates: Array<string | undefined> = [
      this.data?.imageUrl,
    ];

    for (const raw of candidates) {
      const url = (raw || '').toString().trim();
      if (!url) continue;
      if (this.isValidHttpUrl(url)) return url;
      // Accept absolute paths relative to API base
      if (url.startsWith('/')) return `${this.apiUrl}${url.replace(/^\/+/, '')}`;
    }
    return null;
  }

  private isValidHttpUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  // Build blob URLs for logos and signatures
  private async prepareAssetUrls(): Promise<void> {
    try {
      const [l1, l2, l3] = await Promise.all([
        this.toBlobUrl(this.data?.logoPath1),
        this.toBlobUrl(this.data?.logoPath2),
        this.toBlobUrl(this.data?.logoPath3)
      ]);
      this.logo1Url = l1;
      this.logo2Url = l2;
      this.logo3Url = l3;

      if (Array.isArray(this.data?.signatures)) {
        this.signatureUrls = await Promise.all(
          this.data.signatures.map((s: any) => this.toBlobUrl(s?.signatorySignaturePath))
        );
      }
    } catch {
      // swallow errors; fallbacks are applied in toBlobUrl
    }
  }

  private async toBlobUrl(raw?: string | null): Promise<string | null> {
    const path = (raw || '').toString().trim();
    if (!path) return null;

    // Construct an absolute URL
    let url = path;
    if (!this.isValidHttpUrl(path)) {
      if (path.startsWith('/')) {
        url = `${this.apiUrl}${path.replace(/^\/+/, '')}`;
      } else {
        // Treat as file name for the common photo download endpoint
        url = `${this.apiUrl}api/photo/download/${encodeURIComponent(path)}`;
      }
    }

    try {
      // Attach auth header for same-origin API calls
      let headers: HttpHeaders | undefined;
      if (url.startsWith(this.apiUrl)) {
        const token = localStorage.getItem('token');
        if (token) {
          headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        }
      }

      const blob = await firstValueFrom(
        this.http.get(url, { responseType: 'blob', headers })
      ) as Blob;
      const blobUrl = URL.createObjectURL(blob);
      this.createdBlobUrls.push(blobUrl);
      return blobUrl;
    } catch (err) {
      // Fallback to direct URL (either original or constructed)
      return this.isValidHttpUrl(path) ? path : url;
    }
  }

  private revokeUrls(): void {
    this.createdBlobUrls.forEach((u) => {
      try { URL.revokeObjectURL(u); } catch {}
    });
    this.createdBlobUrls = [];
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

  ngOnDestroy(): void {
    this.revokeUrls();
  }

}
