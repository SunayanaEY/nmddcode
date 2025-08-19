import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../training/services/training.service';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../components/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../components/table/table.component';
import { CertificateLayoutComponent } from '../certificate-layout/certificate-layout.component';

@Component({
  selector: 'app-all-certificate',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    TableComponent,
    CertificateLayoutComponent,
  ],
  templateUrl: './all-certificate.component.html',
  styleUrl: './all-certificate.component.css',
})
export class AllCertificateComponent {
  constructor(
    private router: Router,
    private trainingsService: TrainingService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      // alert(
      //   'Received Data: ' +
      //     JSON.stringify(navigation.extras.state['trainingData'])
      // );
      const trainingData = navigation.extras.state['trainingData'];

      this.trainingTitle = trainingData.trainingTitle;
      this.trainingId = trainingData.id;
      this.trainingInstituteId = trainingData.trainingCenterId;

      this.trainingInstituteName = trainingData.trainingInstituteName;
      this.trainingDate = trainingData.trainingDate;

      this.logoPath1 = trainingData.logoPath1;
      this.logoPath2 = trainingData.logoPath2;
      this.logoPath3 = trainingData.logoPath3;

      this.signatures = trainingData.signatures;

      // alert('Training insitutre Id : ' + trainingData.trainingCenterId);

      this.trainingsService
        .getAllTrainees('ALL', this.trainingInstituteId, this.trainingId)
        .subscribe({
          next: (res) => {
            if (res && res.data) {
              this.tableData = res.data.map((item: any) => {
                // Convert aadharMasked from scientific notation to normal string
                let aadharMasked = item.aadharMasked;

                if (aadharMasked !== null && aadharMasked !== undefined) {
                  // Convert to number safely and back to string without exponential format
                  aadharMasked = Number(aadharMasked).toLocaleString(
                    'fullwide',
                    { useGrouping: false }
                  );
                }

                // Combine location parts (ignore null/empty values)
                const locationParts = [
                  item.venueBlock,
                  item.venueDistrict,
                  item.venueState,
                ].filter(Boolean);

                return {
                  ...item,
                  aadharMasked: aadharMasked, // replace with corrected format
                  trainingDate: this.trainingDate, // formatted from API
                  location: locationParts.join(', '),
                  trainingInstituteName: this.trainingInstituteName,
                  trainingTitle: this.trainingTitle,
                  logoPath1: this.logoPath1,
                  logoPath2: this.logoPath2,
                  logoPath3: this.logoPath3,
                  signatures: this.signatures,
                };
              });
            } else {
              console.warn('No data found in response:', res);
              this.tableData = [];
            }
          },
          error: (err) => {
            console.error('Error fetching trainees:', err);
          },
        });
    }
  }
  isExportCSV: Boolean = true;
  isExportPdf: Boolean = true;
  pdfHeaders: Array<string> = [
    'Sr.No.',
    'Trainee Name',
    'UIN',
    'Gender',
    'Age',
    'Email',
    'Masked Aadhar',
    'Contact No.',
    'Status',
  ];
  columnKeys: Array<string> = [
    'name',
    'uin',
    'gender',
    'age',
    'email',
    'aadharMasked',
    'contactNumber',
    'status',
  ];
  selectedItem: any;
  trainingTitle: any;
  trainingInstituteId: any;
  trainingDate: any;
  logoPath1: any;
  logoPath2: any;
  logoPath3: any;
  signatures: any;
  trainingInstituteName: any;
  trainingId: any;
  selectedSignatureFile: File | null = null;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/dashboard/training-module' },
    { label: 'Approved Certificate' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Trainee Name' },
    { key: 'gender', header: 'Gender' },
    { key: 'age', header: 'Age' },
    { key: 'email', header: 'Email' },
    { key: 'aadharMasked', header: 'Masked Aadhar' },
    { key: 'contactNumber', header: 'Contact No.' },
    { key: 'status', header: 'Status' },
  ];

  tableActions: TableAction[] = [
    {
      name: 'view',
      icon: 'bi bi-eye',
      class: 'btn-info',
      title: 'View',
    },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-success',
      title: 'Download',
      condition: (row: any) => row.status === 'APPROVED',
    },
  ];

  filters = {
    date: '',
    trainingTitle: '',
    status: 'ALL',
  };
  tableData: any = [];

  // tableData: any[] = [
  //   {
  //     traineeName: 'Sayan Jha',
  //     trainingTitle: 'ABC Training',
  //     date: '01-May-2025',
  //     scheme: 'PMKVY',
  //     location: 'Kanpur,Uttar Pradesh',
  //     submittedOn: '03-May-2025',
  //     status: 'Approved',
  //   },
  //   {
  //     traineeName: 'Riya Sharma',
  //     trainingTitle: 'Skill India',
  //     date: '02-May-2025',
  //     scheme: 'DDUGKY',
  //     location: 'Lucknow,Uttar Pradesh',
  //     submittedOn: '04-May-2025',
  //     status: 'Pending',
  //   },
  //   {
  //     traineeName: 'Amit Verma',
  //     trainingTitle: 'PMKVY Workshop',
  //     date: '03-May-2025',
  //     scheme: 'PMKVY',
  //     location: 'Noida,Uttar Pradesh',
  //     submittedOn: '05-May-2025',
  //     status: 'Rejected',
  //   },
  // ];

  get filteredTableData(): any[] {
    return this.tableData.filter(
      (item: { date: string; trainingTitle: string; status: string }) => {
        const matchesDate = this.filters.date
          ? item.date === this.formatDate(this.filters.date)
          : true;

        const matchesTitle = this.filters.trainingTitle
          ? item.trainingTitle
              ?.toLowerCase()
              .includes(this.filters.trainingTitle.toLowerCase())
          : true;

        const matchesStatus =
          this.filters.status === 'ALL'
            ? true
            : item.status?.toLowerCase() === this.filters.status.toLowerCase();

        return matchesDate && matchesTitle && matchesStatus;
      }
    );
  }

  formatDate(input: string): string {
    const date = new Date(input);
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  handleTableAction(event: { action: string; item: any; index: number }): void {
    this.selectedItem = event.item;
    if (event.action === 'view') {
      document.getElementById('modalBtn')?.click();
    } else if (event.action === 'download') {
      const modalElement = document.getElementById('viewCertificateModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    }
  }
}
