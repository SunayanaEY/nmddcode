import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import {
  TableAction,
  TableColumn,
  TableComponent,
} from '../../../components/table/table.component';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainingService } from '../services/training.service';
import { AdminService } from '../services/training-admin.service';
import { TraineeDetails, TrainingsList } from '../models/training.model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { LatestCertificateLayoutComponent } from '../../latest-certificate-layout/latest-certificate-layout.component';
import { IdCardComponent } from '../../id-card/id-card.component';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-all-trainings',
  imports: [
    CommonModule,
    // BreadcrumbComponent,
    TableComponent,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    NgxSpinnerModule,
    LatestCertificateLayoutComponent,
    IdCardComponent,
  ],
  templateUrl: './all-trainings.component.html',
  styleUrl: './all-trainings.component.css',
})
export class AllTrainingsComponent {
  isLoading: boolean = false;
  private bootstrap: any;
  trainingDetails: any;
  trainingScheduleUrl: string | null = null;
  isLoadingSchedule: boolean = false;
  @ViewChild('trainingDetailsModal')
  trainingDetailsModal!: ElementRef;
  submitted: Boolean = false;
  trainingForm!: FormGroup;
  isExportCSV: Boolean = true;
  isExportPdf: Boolean = true;
  isBulkCertDownload: Boolean = true;
  fileName: String = 'All_trainings_';
  fileNameTrainees: String = 'All_trainee_List_';
  traineesFile: String = 'All_trainee_List_';
  pdfHeaders: Array<string> = [
    'Sr.No.',
    'Training Title',
    'Scheme',
    'Training Institute',
    'Trainer Name',
    'Location',
    'Training Venue',
    'Start Date',
    'End Date',
  ];
  columnKeys: Array<string> = [
    'trainingTitle',
    'scheme',
    'trainingInstituteName',
    'trainerName',
    'location',
    'venueAddress',
    'startDate',
    'endDate',
  ];
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'All Registered Trainings' },
  ];
  tableColumns: TableColumn[] = [
    // {
    //   key: 'trainingTitle',
    //   header: 'Training Title',
    //   isLink: true,
    //   linkHandler: (row) => this.openTrainingDetails(row),
    // },
    {
      key: 'trainingTitle',
      header: 'Training Title',
    },
    { key: 'scheme', header: 'Scheme' },
    { key: 'trainingInstituteName', header: 'Training Institute' },
    { key: 'trainerName', header: 'Trainer Name' },

    { key: 'location', header: 'Location' },
    { key: 'venueAddress', header: 'Training Venue' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
  ];

  tableActions: TableAction[] = [
    { name: 'view', icon: 'bi bi-eye', class: 'btn-info', title: 'View' },
    {
      name: 'edit',
      icon: 'bi bi-pencil-fill',
      class: 'btn-info',
      title: 'Edit',
    },
    {
      name: 'downloadAllCertificates',
      icon: 'bi bi-download',
      class: 'btn-success',
      title: 'Download all certificates',
      condition: (row: any) =>
        this.userRole == 4 &&
        row.status === 'Certificate Approved / Rejected',
    },
    {
      name: 'downloadAllIdCards',
      icon: 'bi bi-person-badge',
      class: 'btn-primary',
      title: 'Download all ID cards',
      condition: (row: any) =>
        this.userRole == 4 &&
        row.status === 'Certificate Approved / Rejected',
    },
  ];

  trainingsList: TrainingsList[] = [];
  traineeList: TraineeDetails[] = [];
  userData: any = sessionStorage.getItem('user');
  trainingInstituteId: any;
  userRole: any;

  pdfHeadersTrainee: Array<string> = [
    'Sr.No.',
    'Name',
    'Age',
    'Gender',
    'Contact',
    'Email',
  ];
  columnKeysTrainee: Array<string> = [
    'name',
    'age',
    'gender',
    'contactNumber',
    'email',
  ];

  tableColumnsTrainee: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
    { key: 'gender', header: 'Gender' },
    { key: 'contactNumber', header: 'Contact' },
    { key: 'email', header: 'Email' },
  ];

  tableActionsTrainee: TableAction[] = [
    //{ name: 'download', icon: 'bi bi-eye', class: 'btn-info', title: 'Download certificate' },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-success',
      title: 'Download certificate',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private trainingsService: TrainingService,
    private router: Router,
    private adminService: AdminService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}
  filteredData = [...this.trainingsList];

  @ViewChild('hiddenCertificate')
  hiddenCertificate!: LatestCertificateLayoutComponent;

  @ViewChild('hiddenIdCard')
  hiddenIdCard!: IdCardComponent;

  idCardDataForBulk: any = null;
  idCardUinForBulk: string = '';
  certificateDataForBulk: any = null;
  certificateUinForBulk: string = '';

  ngOnInit(): void {
    this.trainingForm = this.formBuilder.group({
      id: [''],
      comment: ['', [Validators.required]],
    });
    //comment this later
    // this.trainingInstituteId = 'be26beca-3b33-4e6f-b497-1de8366e91b8';
    if (this.userData) {
      const user = JSON.parse(this.userData);
      this.trainingInstituteId = user.trainingHeadId;
      this.userRole = user.role;
    }
    this.isLoading = true;
    this.trainingsService
      .getAllTrainings(this.trainingInstituteId)
      .subscribe((res) => {
        this.trainingsList = res.data;
        this.filteredData = [...this.trainingsList];
        let index = 0;
        this.trainingsList.forEach((ele) => {
          const datePipe = new DatePipe('en-US');
          ele['location'] = this.formatLocation(
            ele['venueBlock'],
            ele['venueDistrict'],
            ele['venueState']
          );
          ele['startDate'] = datePipe.transform(
            ele['startDate'],
            'dd/MM/yyyy'
          )!;
          ele['endDate'] = datePipe.transform(
            ele['endDate'],
            'dd/MM/yyyy'
          )!;
          this.trainingsList[index] = ele;
          index++;
        });
        this.isLoading = false;
      });
    this.filteredData = [...this.trainingsList];
    let index = 0;
    this.trainingsList.forEach((ele) => {
      const datePipe = new DatePipe('en-US');
      ele['location'] = this.formatLocation(
        ele['venueBlock'],
        ele['venueDistrict'],
        ele['venueState']
      );
      ele['startDate'] = datePipe.transform(
        ele['startDate'],
        'dd/MM/yyyy'
      )!;
      ele['endDate'] = datePipe.transform(
        ele['endDate'],
        'dd/MM/yyyy'
      )!;
      this.trainingsList[index] = ele;
      index++;
    });
  }
  openTrainingDetails(row: any) {
    // alert('Training insititue : ' + this.trainingInstituteId);
    this.router.navigate(['/admin/All-Trainings'], {
      state: {
        trainingData: row,
      },
    });
  }
  navigateToPending() {
    this.router.navigate(['/admin/approvedrejectedTrainings'], {
      fragment: 'pendingTable',
    });
  }
  navigateToApproved() {
    this.router.navigate(['/admin/approvedrejectedTrainings'], {
      fragment: 'approvedTable',
    });
  }
  navigateToRejected() {
    this.router.navigate(['/admin/approvedrejectedTrainings'], {
      fragment: 'rejectedTable',
    });
  }

  handleTableAction(event: { action: string; item: any; index: number }): void {
    if (event.action === 'edit') {
      // alert(JSON.stringify(event.item));
      this.router.navigate(['/admin/training-certificate-generation'], {
        queryParams: { trainingId: event.item.id, populate: true },
      });
    } else if (event.action === 'downloadAllCertificates') {
      this.downloadAllCertificatesForTraining(event.item);
    } else if (event.action === 'downloadAllIdCards') {
      this.downloadAllIdCardsForTraining(event.item);
    } else {
      this.traineeList = [];
      this.trainingDetails = event.item;
      this.prepareTrainingScheduleUrl();
      this.fileNameTrainees = this.traineesFile;
      this.fileNameTrainees =
        this.fileNameTrainees +
        this.trainingDetails.trainingInstituteName +
        '_' +
        this.trainingDetails.trainingTitle +
        '_';

      this.modalService.open(this.trainingDetailsModal, {
        size: 'lg',
        scrollable: true,
        backdrop: 'static',
        keyboard: false,
      });
    }
  }

  filters = {
    trainingTitle: null,
    scheme: null,
    trainingInstituteName: null,
    trainerName: null,
    location: null,
    startDate: null,
    endDate: null,
    status: null,
  };

  applyFilters(): void {
    this.filteredData = this.trainingsList.filter((row) => {
      return (
        (!this.filters.trainingTitle ||
          row.trainingTitle === this.filters.trainingTitle) &&
        (!this.filters.scheme || row.scheme === this.filters.scheme) &&
        (!this.filters.trainingInstituteName ||
          row.trainingInstituteName === this.filters.trainingInstituteName) &&
        (!this.filters.trainerName ||
          row.trainerName === this.filters.trainerName) &&
        (!this.filters.location || row.location === this.filters.location) &&
        (!this.filters.startDate ||
          row.startDate === this.filters.startDate) &&
        (!this.filters.endDate || row.endDate === this.filters.endDate) &&
        (!this.filters.status || row.status === this.filters.status)

        // (!this.filters.sync_status || row.sync_status.toString() === this.filters.sync_status.toString()) &&
      );
    });

    this.filteredData.forEach((ele) => {
      console.log(ele.trainingTitle);
    });
  }

  clearStatusFilter(): void {
    this.filters.status = null;
    this.applyFilters();
  }
  uniqueValuesTrainingTitle(): any[] {
    return [
      ...new Set(this.trainingsList.map((item) => item['trainingTitle'])),
    ];
  }

  uniqueValuesStartDate(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['startDate']))];
  }

  uniqueValuesEndDate(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['endDate']))];
  }

  uniqueValuesScheme(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['scheme']))];
  }

  uniqueValuesInstituteName(): any[] {
    return [
      ...new Set(
        this.trainingsList.map((item) => item['trainingInstituteName'])
      ),
    ];
  }
  uniqueValuesTrainerName(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['trainerName']))];
  }
  uniqueValueslocation(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['location']))];
  }

  uniqueValuesStatus(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['status']))];
  }

  private formatLocation(
    venueBlock: string | null | undefined,
    venueDistrict: string | null | undefined,
    venueState: string | null | undefined
  ): string {
    return [venueBlock, venueDistrict, venueState]
      .map((value) => (value || '').trim())
      .filter((value) => value.length > 0)
      .join(', ');
  }

  reset() {}

  open() {}
  get formControls() {
    return this.trainingForm.controls;
  }

  async toBlobUrl(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.adminService.downloadInstituteImage(fileName).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          resolve(url);
        },
        error: (err) => {
          console.error('Error fetching file blob:', err);
          reject(err);
        },
      });
    });
  }

  async prepareTrainingScheduleUrl() {
    this.trainingScheduleUrl = null;
    this.isLoadingSchedule = false;

    if (this.trainingDetails?.trainingScheduleDetail) {
      try {
        this.isLoadingSchedule = true;
        this.trainingScheduleUrl = await this.toBlobUrl(
          this.trainingDetails.trainingScheduleDetail
        );
      } catch (error) {
        console.error('Failed to load training schedule:', error);
        this.trainingScheduleUrl = null;
      } finally {
        this.isLoadingSchedule = false;
      }
    }
  }

  private async downloadAllCertificatesForTraining(
    training: any
  ): Promise<void> {
    const trainingId = training?.id;
    if (!trainingId) {
      this.toastr.error('Training ID not available for download');
      return;
    }

    this.isLoading = true;
    this.spinner.show();
    try {
      const response = await firstValueFrom(
        this.trainingsService.getTrainingWithTrainee(trainingId)
      );
      const trainingData: any =
        response && (response as any).data ? (response as any).data : response;

      if (!trainingData || !Array.isArray(trainingData.trainees)) {
        this.toastr.error('Invalid training data received');
        return;
      }

      const trainees = trainingData.trainees;

      const approvedTrainees = trainees.filter(
        (t: any) =>
          t.status === 'Approved by Organization' ||
          t.status === 'APPROVED BY ORGANIZATION' ||
          t.status === 'Approved by State Head' ||
          t.status === 'Certificate Issued & downloaded'
      );

      if (approvedTrainees.length === 0) {
        this.toastr.info('No approved trainees found for this training');
        return;
      }

      const signatures =
        Array.isArray((trainingData as any).signatures) &&
        (trainingData as any).signatures.length > 0
          ? (trainingData as any).signatures
          : Array.isArray((trainingData as any).signatories)
          ? (trainingData as any).signatories
          : [];

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < approvedTrainees.length; i++) {
        const trainee = approvedTrainees[i];

        this.certificateDataForBulk = {
          ...trainingData,
          ...trainee,
          signatures,
          traineePhotoId: (trainee as any).photoId,
        };
        this.certificateUinForBulk = trainee.uin || 'UIN2025345780991';

        this.cdr.detectChanges();
        if (this.hiddenCertificate) {
          const startTime = Date.now();
          const maxWait = 5000;
          while (!this.hiddenCertificate.isReady) {
            if (Date.now() - startTime > maxWait) {
              console.warn(
                'Bulk Certificate: Timeout waiting for certificate ready',
                trainee.name
              );
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (
          this.hiddenCertificate &&
          this.hiddenCertificate.certificateContent
        ) {
          const element = this.hiddenCertificate.certificateContent
            .nativeElement;
          const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            allowTaint: true,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const targetWidth = pdfWidth - 20;
          const targetHeight = (imgProps.height * targetWidth) / imgProps.width;
          const centerX = (pdfWidth - targetWidth) / 2;
          let posY = (pdfHeight - targetHeight) / 2;

          if (targetHeight > pdfHeight - 20) {
            posY = 10;
            const newHeight = pdfHeight - 20;
            const newWidth = (imgProps.width * newHeight) / imgProps.height;
            pdf.addImage(
              imgData,
              'PNG',
              (pdfWidth - newWidth) / 2,
              posY,
              newWidth,
              newHeight
            );
          } else {
            pdf.addImage(
              imgData,
              'PNG',
              centerX,
              posY,
              targetWidth,
              targetHeight
            );
          }

          if (i < approvedTrainees.length - 1) {
            pdf.addPage();
          }
        }
      }

      pdf.save(`Bulk_Certificates_${training.trainingTitle || 'Training'}.pdf`);
      this.toastr.success('Certificates generated successfully');
    } catch (error) {
      console.error('Error generating bulk certificates:', error);
      this.toastr.error('Failed to generate certificates');
    } finally {
      this.isLoading = false;
      this.spinner.hide();
      this.certificateDataForBulk = null;
      this.cdr.detectChanges();
    }
  }

  private async downloadAllIdCardsForTraining(training: any): Promise<void> {
    const trainingId = training?.id;
    if (!trainingId) {
      this.toastr.error('Training ID not available for download');
      return;
    }

    this.isLoading = true;
    this.spinner.show();

    try {
      const response = await firstValueFrom(
        this.trainingsService.getTrainingWithTrainee(trainingId)
      );

      const trainingData =
        response && (response as any).data ? (response as any).data : response;

      if (!trainingData || !Array.isArray(trainingData.trainees)) {
        this.toastr.error('Invalid training data received');
        return;
      }

      const approvedTrainees = trainingData.trainees.filter(
        (t: any) =>
          t.status === 'Approved by Organization' ||
          t.status === 'APPROVED BY ORGANIZATION' ||
          t.status === 'Approved by State Head' ||
          t.status === 'Certificate Issued & downloaded'
      );

      if (approvedTrainees.length === 0) {
        this.toastr.info('No approved trainees found for this training');
        return;
      }

      const signatures =
        Array.isArray(trainingData.signatures) && trainingData.signatures.length
          ? trainingData.signatures
          : Array.isArray(trainingData.signatories)
          ? trainingData.signatories
          : [];

      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const cols = 2;
      const rows = 2;
      const cardsPerPage = cols * rows;

      const margin = 10;
      const gap = 5;

      const usableWidth = pdfWidth - margin * 2 - gap;
      const usableHeight = pdfHeight - margin * 2 - gap;

      const cardWidth = usableWidth / cols;
      const cardHeight = usableHeight / rows;

      let positionIndex = 0;

      for (let i = 0; i < approvedTrainees.length; i++) {
        const trainee = approvedTrainees[i];

        this.idCardDataForBulk = {
          ...trainingData,
          ...trainee,
          signatures,
          traineePhotoId: (trainee as any).photoId,
          logoPath1: trainingData.logoPath1,
          logoPath2: trainingData.logoPath2,
          logoPath3: trainingData.logoPath3,
        };

        this.idCardUinForBulk = trainee.uin || 'UIN2025345780991';

        this.cdr.detectChanges();

        if (this.hiddenIdCard) {
          const startTime = Date.now();
          const maxWait = 5000;
          while (!this.hiddenIdCard.isReady) {
            if (Date.now() - startTime > maxWait) {
              console.warn(
                'Bulk ID Card: Timeout waiting for card ready',
                trainee.name
              );
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        if (this.hiddenIdCard?.idCardContent) {
          const element = this.hiddenIdCard.idCardContent.nativeElement;

          const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/png');

          const col = positionIndex % cols;
          const row = Math.floor(positionIndex / cols);

          const x = margin + col * (cardWidth + gap);
          const y = margin + row * (cardHeight + gap);

          pdf.addImage(imgData, 'PNG', x, y, cardWidth, cardHeight);

          positionIndex++;

          if (positionIndex >= cardsPerPage && i < approvedTrainees.length - 1) {
            pdf.addPage();
            positionIndex = 0;
          }
        }
      }

      pdf.save(`Bulk_IDCards_${training.trainingTitle || 'Training'}.pdf`);
      this.toastr.success('ID cards generated successfully');
    } catch (error) {
      console.error('Error generating bulk ID cards:', error);
      this.toastr.error('Failed to generate ID cards');
    } finally {
      this.isLoading = false;
      this.spinner.hide();
      this.idCardDataForBulk = null;
      this.cdr.detectChanges();
    }
  }

  keyFunc() {}
}
