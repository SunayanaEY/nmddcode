import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingService } from '../training/services/training.service';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../components/breadcrumb/breadcrumb.component';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../components/table/table.component';
import { CertificateLayoutComponent } from '../certificate-layout/certificate-layout.component';
import { NewCertificateLayoutComponent } from '../new-certificate-layout/new-certificate-layout.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-approved-certificate',
  standalone: true,
  imports: [
    TranslateModule,
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    TableComponent,
    NewCertificateLayoutComponent,
  ],
  templateUrl: './approved-certificate.component.html',
  styleUrl: './approved-certificate.component.css',
})
export class ApprovedCertificateComponent {
  selectedItem: any;
  isExportCSV: Boolean = true;
  isExportPdf: Boolean = true;
  // pdfHeaders: Array<string> = [
  //   'Sr.No.',
  //   'Training Title',
  //   'Scheme',
  //   'Training Institute',
  //   'Trainer Name',
  //   'Location',
  //   'Training Date',
  // ];
  // columnKeys: Array<string> = [
  //   'trainingTitle',
  //   'scheme',
  //   'trainingInstituteName',
  //   'trainerName',
  //   'trainingDate',
  // ];
  selectedSignatureFile: File | null = null;
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/dashboard/training-module' },
    { label: 'Approved Certificate' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'traineeName', header: 'Trainee Name' },
    { key: 'trainingTitle', header: 'Training Title' },
    { key: 'date', header: 'Date' },
    { key: 'scheme', header: 'Scheme' },
    { key: 'location', header: 'Location' },
    { key: 'submittedOn', header: 'Submitted On' },
    { key: 'status', header: 'Status' },
  ];

  tableActions: TableAction[] = [
    { name: 'view', icon: 'bi bi-eye', class: 'btn-info', title: 'View' },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-success',
      title: 'Download',
    },
  ];

  filters = {
    date: '',
    trainingTitle: '',
    status: 'ALL',
  };

  tableData: any[] = [
    {
      traineeName: 'Sayan Jha',
      trainingTitle: 'ABC Training',
      date: '01-May-2025',
      scheme: 'PMKVY',
      location: 'Kanpur,Uttar Pradesh',
      submittedOn: '03-May-2025',
      status: 'Approved',
    },
    {
      traineeName: 'Riya Sharma',
      trainingTitle: 'Skill India',
      date: '02-May-2025',
      scheme: 'DDUGKY',
      location: 'Lucknow,Uttar Pradesh',
      submittedOn: '04-May-2025',
      status: 'Pending',
    },
    {
      traineeName: 'Amit Verma',
      trainingTitle: 'PMKVY Workshop',
      date: '03-May-2025',
      scheme: 'PMKVY',
      location: 'Noida,Uttar Pradesh',
      submittedOn: '05-May-2025',
      status: 'Rejected',
    },
  ];
  constructor(private trainingsService: TrainingService) {}
  ngOnInit(): void {
    this.trainingsService;
    // .getAllTrainees('APPROVED',this.trainingInstituteId,this.trainingId)
    // .subscribe((res) => {
    //   this.trainingsList = res.data;
    //   this.filteredData = [...this.trainingsList];
    //   let index = 0;
    //   this.trainingsList.forEach((ele) => {
    //     console.log('data : ' + JSON.stringify(ele));
    //     const datePipe = new DatePipe('en-US');
    //     ele['location'] =
    //       ele['venueBlock'] +
    //       ',' +
    //       ele['venueDistrict'] +
    //       ',' +
    //       ele['venueState'];
    //     ele['trainingDate'] = datePipe.transform(
    //       ele['trainingDate'],
    //       'dd/MM/yyyy'
    //     )!;
    //     this.trainingsList[index] = ele;
    //     index++;
    //   });
    // });
  }
  get filteredTableData(): any[] {
    return this.tableData.filter((item) => {
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
    });
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
    if (event.action === 'view') {
      this.selectedItem = event.item;

      const modalElement = document.getElementById('viewCertificateModal');
      if (modalElement) {
        const modal = new (window as any).bootstrap.Modal(modalElement);
        modal.show();
      }
    } else if (event.action === 'download') {
      console.log('Downloading:', event.item);
    }
  }
}
