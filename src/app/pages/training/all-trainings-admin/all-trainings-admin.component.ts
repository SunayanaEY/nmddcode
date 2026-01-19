import { Component, Input, ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Component as AngularComponent,
  ElementRef as AngularElementRef,
  TemplateRef,
  ViewChild as AngularViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import {
  TableColumn,
  TableAction,
  TableComponent,
} from '../../../components/table/table.component';
import { TrainingsList, TraineeDetails } from '../models/training.model';
import { TrainingService } from '../services/training.service';
import { AdminService } from '../services/training-admin.service';
import { NgSelectModule } from '@ng-select/ng-select';



import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { LatestCertificateLayoutComponent } from '../../latest-certificate-layout/latest-certificate-layout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-all-trainings-admin',
  imports: [
    CommonModule,
    // BreadcrumbComponent,
    TableComponent,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    LatestCertificateLayoutComponent,
    TranslateModule,
  ],
  templateUrl: './all-trainings-admin.component.html',
  styleUrl: './all-trainings-admin.component.css',
  // encapsulation: ViewEncapsulation.None
})
export class AllTrainingsAdminComponent {
  
  trainingDetails: any;
  trainingScheduleUrl: string | null = null;
  isLoadingSchedule: boolean = false;
  apiUrl = environment.apiUrl;

  @AngularViewChild('trainingDetailsModal')
  trainingDetailsModal!: AngularElementRef;
  @AngularViewChild('rejectModal')
  rejectModal!: AngularElementRef;
  @AngularViewChild('certificateModal')
  certificateModal!: AngularElementRef;
  @AngularViewChild('traineeTable')
  traineeTable!: TableComponent;
  @AngularViewChild('hiddenCertificate')
  hiddenCertificate!: LatestCertificateLayoutComponent;

  submitted: Boolean = false;
  
  certificateData: any = null;
  certificateDataForBulk: any = null;
  certificateUinForBulk: string = '';
  selectedTraineeForCertificate: any = null;
  trainingForm!: FormGroup;
  rejectionRemark: string = '';
  // falseVariable = false;
  rejectForm!: FormGroup;
  selectedTraineeForReject: any = null;
  selectedTraineesForBulkReject: any[] = [];
  currentTrainingInstituteId: string = '';
  currentTrainingId: number = 0;
  isExportCSV: Boolean = true;
  isExportPdf: Boolean = true;
  isBulkCertDownload: Boolean = true;
  
  trainingInstituteHeadId: any = null;
  userRole: any;
  userId: any;
  pageTitle: string = 'All Trainings';
  fileName: String = 'All_trainings_';
  fileNameTrainees: String = 'All_trainee_List_';
  traineesFile: String = 'All_trainee_List_';
  falseVariable: boolean = false;
  selectedItems: Set<any> = new Set();
  pdfHeaders: Array<string> = [
    'Sr.No.',
    'Training Title',
    'Scheme',
    'Training Institute',
    'Trainer Name',
    'Location',
    'Start Date',
    'End Date',
    'Status',
  ];
  columnKeys: Array<string> = [
    'trainingTitle',
    'scheme',
    'trainingInstituteName',
    'trainerName',
    'location',
    'trainingDate',
    'status',
  ];
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/admin/role-dashboard' },
    { label: 'All Trainings' },
  ];
  tableColumns: TableColumn[] = [
    { key: 'trainingTitle', header: 'Training Title' },
    { key: 'scheme', header: 'Scheme' },
    { key: 'trainingInstituteName', header: 'Training Institute' },
    { key: 'trainerName', header: 'Trainer Name' },
    { key: 'location', header: 'Location' },
    { key: 'venueAddress', header: 'Training Venue' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'endDate', header: 'End Date' },
    { key: 'status', header: 'Status' },
  ];

  tableActions: TableAction[] = [
    { name: 'view', icon: 'bi bi-eye', class: 'btn-info', title: 'View' },
    {
      name: 'downloadAllCertificates',
      icon: 'bi bi-download',
      class: 'btn-success',
      title: 'Download all certificates',
      condition: (row: any) =>
        (this.userRole === 3 || this.userRole === 4) &&
        row.status === 'TRAINEE ORGANIZATION DECISIONS COMPLETED',
    },
    {
      name: 'downloadAllIdCards',
      icon: 'bi bi-person-badge',
      class: 'btn-primary',
      title: 'Download all ID cards',
      condition: () => this.userRole === 3 || this.userRole === 4,
    },
  ];

  trainingsList: TrainingsList[] = [];
  traineeList: TraineeDetails[] = [];

  pdfHeadersTrainee: Array<string> = [
    'Sr.No.',
    'Name',
    'Age',
    'Gender',
    'Contact',
    'Email',
    'Status',
  ];
  columnKeysTrainee: Array<string> = [
    'name',
    'age',
    'gender',
    'contactNumber',
    'email',
    'status',
  ];

  tableColumnsTrainee: TableColumn[] = [
    { key: 'uin', header: 'Uin' },
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
    { key: 'gender', header: 'Gender' },
    { key: 'contactNumber', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
  ];

  tableActionsTrainee: TableAction[] = [
    {
      name: 'approve',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Approve',
      condition: (row: any) => {
        // For Institute Head (role 3), only show approve button for Trainees details uploaded status
        if (this.userRole === 3) {
          return row.status === 'Trainees details uploaded';
        }
        // For user role 6, show approve button for Trainees details uploaded or Recommended by Institute Head
        if (this.userRole === 6) {
          return (
            row.status === 'Trainees details uploaded' ||
            row.status === 'Recommended by Institute Head'
          );
        }
        // For other roles, show approve button for Trainees details uploaded
        return row.status === 'Trainees details uploaded';
      },
    },
    {
      name: 'reject',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Reject',
      condition: (row: any) => {
        // For Institute Head (role 3), only show reject button for Trainees details uploaded status
        if (this.userRole === 3) {
          return row.status === 'Trainees details uploaded';
        }
        // For user role 6, show reject button for Trainees details uploaded or Recommended by Institute Head
        if (this.userRole === 6) {
          return (
            row.status === 'Trainees details uploaded' ||
            row.status === 'Recommended by Institute Head'
          );
        }
        // For other roles, show reject button for Trainees details uploaded
        return row.status === 'Trainees details uploaded';
      },
    },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-info',
      title: 'Download certificate',
      condition: (row: any) =>
        row.status === 'Approved by State Head' ||
        row.status === 'APPROVED BY ORGANIZATION' ||
        row.status === 'Approved by Organization' ||
        row.status === 'Certificate Issued & downloaded',
    },
  ];

  // Bulk actions for multi-select
  bulkActionsTrainee: TableAction[] = [
    {
      name: 'bulkApprove',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Bulk Approve',
      condition: (rows: any[]) => {
        // For Institute Head (role 3), only show bulk approve if there are Trainees details uploaded status items
        if (this.userRole === 3 || this.userRole == 6) {
          return rows.some(
            (row) =>
              row.status === 'Trainees details uploaded' ||
              row.status === 'Recommended by Institute Head'
          );
        }
        // For other roles, show bulk approve if there are eligible items
        return rows.some(
          (row) =>
            row.status === 'Trainees details uploaded' ||
            row.status === 'Recommended by Institute Head'
        );
      },
    },
    {
      name: 'bulkReject',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Bulk Reject',
      condition: (rows: any[]) => {
        // For Institute Head (role 3), only show bulk reject if there are Trainees details uploaded status items
        if (this.userRole === 3) {
          return rows.some((row) => row.status === 'Trainees details uploaded');
        }
        // For other roles, show bulk reject if there are eligible items
        return rows.some(
          (row) =>
            row.status === 'Trainees details uploaded' ||
            row.status === 'Recommended by Institute Head'
        );
      },
    },
  ];

  enableMultiSelectTrainee: boolean = true;
  isTableLoading: boolean = false;
  rejectModalRef: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private trainingsService: TrainingService,
    private adminService: AdminService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}
  filteredData = [...this.trainingsList];

  ngOnInit(): void {
    this.getRole();
    this.getTrainingInstituteId();

    // Set page title and breadcrumb based on user role
    if (this.userRole === 5) {
      this.pageTitle = 'Approve and Reject Trainings';
      this.breadcrumbItems = [
        { label: 'Training Module', url: '/admin/training-module' },
        { label: 'Approve and Reject Trainings' },
      ];
    } else {
      this.pageTitle = 'All Trainings';
      this.breadcrumbItems = [
        { label: 'Training Module', url: '/admin/training-module' },
        { label: 'All Trainings' },
      ];
    }

    if (this.userRole === 1) {
      this.tableActionsTrainee = [
        {
          name: 'download',
          icon: 'bi bi-download',
          class: 'btn-info',
          title: 'Download certificate',
          condition: (row: any) =>
            row.status === 'Approved by State Head' ||
            row.status === 'Certificate Issued & downloaded' ||
            row.status === 'Approved by Organization' ||
            row.status === 'APPROVED BY ORGANIZATION',
        },
      ];
    } else if (this.userRole === 3) {
      this.tableActionsTrainee = [
        {
          name: 'approve',
          icon: 'bi bi-check-circle',
          class: 'btn-success',
          title: 'Approve',
          condition: (row: any) => row.status === 'Trainees details uploaded',
        },
        {
          name: 'reject',
          icon: 'bi bi-x-circle',
          class: 'btn-danger',
          title: 'Reject',
          condition: (row: any) => row.status === 'Trainees details uploaded',
        },
        {
          name: 'download',
          icon: 'bi bi-download',
          class: 'btn-info',
          title: 'Download certificate',
          condition: (row: any) =>
            row.status === 'APPROVED' ||
            row.status === 'Certificate Issued & downloaded' ||
            row.status === 'Approved by State Head' ||
            row.status === 'Approved by Organization' ||
            row.status === 'APPROVED BY ORGANIZATION',
        },
      ];
    } else if (this.userRole === 5) {
      this.tableActionsTrainee = [
        {
          name: 'approve',
          icon: 'bi bi-check-circle',
          class: 'btn-success',
          title: 'Approve',
          condition: (row: any) =>
            row.status === 'Recommended by Institute Head',
        },
        {
          name: 'reject',
          icon: 'bi bi-x-circle',
          class: 'btn-danger',
          title: 'Reject',
          condition: (row: any) =>
            row.status === 'Recommended by Institute Head',
        },
        {
          name: 'download',
          icon: 'bi bi-download',
          class: 'btn-info',
          title: 'Download certificate',
          condition: (row: any) =>
            row.status === 'Approved by State Head' ||
            row.status === 'Approved by Organization' ||
            row.status === 'APPROVED BY ORGANIZATION',
        },
      ];

      this.bulkActionsTrainee = [
        {
          name: 'bulkApprove',
          icon: 'bi bi-check-circle',
          class: 'btn-success',
          title: 'Bulk Approve',
          condition: (rows: any[]) => {
            return rows.some(
              (row) => row.status === 'Recommended by Institute Head'
            );
          },
        },
        {
          name: 'bulkReject',
          icon: 'bi bi-x-circle',
          class: 'btn-danger',
          title: 'Bulk Reject',
          condition: (rows: any[]) => {
            return rows.some(
              (row) => row.status === 'Recommended by Institute Head'
            );
          },
        },
      ];
    }
    this.trainingForm = this.formBuilder.group({
      id: [''],
      comment: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });

    this.rejectForm = this.formBuilder.group({
      remarks: ['', [Validators.required]],
    });
    if (this.userRole == 3) {
      this.isTableLoading = true;
      this.trainingsService
        .getAllTrainings(this.trainingInstituteHeadId)
        .subscribe({
          next: (res) => {
            this.trainingsList = res.data;
            this.filteredData = [...this.trainingsList];
            let index = 0;
            this.trainingsList.forEach((ele) => {
              const datePipe = new DatePipe('en-US');
              ele['location'] =
                ele['venueBlock'] +
                ',' +
                ele['venueDistrict'] +
                ',' +
                ele['venueState'];
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
            this.isTableLoading = false;
          },
          error: (error) => {
            console.error('Error loading trainings:', error);
            this.isTableLoading = false;
          },
        });
    }
    // else if (this.userRole == 6) {
    //   this.isTableLoading = true;
    //   this.trainingsService.getAllTrainingOrganization(this.userId).subscribe({
    //     next: (res) => {
    //       this.trainingsList = res.data;
    //       this.filteredData = [...this.trainingsList];
    //       let index = 0;
    //       this.trainingsList.forEach((ele) => {
    //         const datePipe = new DatePipe('en-US');
    //         ele['location'] =
    //           ele['venueBlock'] +
    //           ',' +
    //           ele['venueDistrict'] +
    //           ',' +
    //           ele['venueState'];
    //         ele['trainingDate'] = datePipe.transform(
    //           ele['trainingDate'],
    //           'dd/MM/yyyy'
    //         )!;
    //         this.trainingsList[index] = ele;
    //         index++;
    //       });
    //       this.isTableLoading = false;
    //     },
    //     error: (error) => {
    //       console.error('Error loading trainings:', error);
    //       this.isTableLoading = false;
    //     },
    //   });
    // }
    else {
      this.isTableLoading = true;
      this.trainingsService.getAllTraining().subscribe({
        next: (res) => {
          this.trainingsList = res.data;
          this.filteredData = [...this.trainingsList];
          let index = 0;
          this.trainingsList.forEach((ele) => {
            const datePipe = new DatePipe('en-US');
            ele['location'] =
              ele['venueBlock'] +
              ',' +
              ele['venueDistrict'] +
              ',' +
              ele['venueState'];
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
          this.isTableLoading = false;
        },
        error: (error) => {
          console.error('Error loading trainings:', error);
          this.isTableLoading = false;
        },
      });
    }
  }

  sendForApproval() {
    this.spinner.show();
    this.adminService
      .sendTrainingToValidate(this.trainingDetails.id)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.toastr.success(
              response.data.message ||
                'Training sent for approval successfully',
              'Success'
            );
            this.ngOnInit();
            this.falseVariable = true;
            this.modalService.dismissAll();
          } else {
            this.toastr.error(
              response.message || 'Failed to send training for approval',
              'Error'
            );
            this.falseVariable = false;
            this.modalService.dismissAll();
          }
        },
        error: (error) => {
          this.spinner.hide();
          const errorMessage =
            error.error?.message ||
            'An error occurred while sending training for approval';
          this.toastr.error(errorMessage, 'Error');
          console.error('Error sending training for approval:', error);
          this.falseVariable = false;
          this.modalService.dismissAll();
        },
      });
  }
  openRejectModal(modal: TemplateRef<any>) {
    this.rejectionRemark = ''; // reset each time
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
  }
  submitRejection(modal: any) {
    if (!this.rejectionRemark.trim()) {
      this.toastr.warning('Please enter a remark before rejecting.');
      return;
    }

    modal.close(); // close modal before proceeding
    this.rejectTrainingSchedule();
  }

  rejectTrainingSchedule() {
    this.spinner.show();
    this.adminService
      .rejectTrainingSchedule(this.trainingDetails.id, this.rejectionRemark)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.toastr.success(
              response.data.message || 'Training rejected successfully',
              'Success'
            );
            this.ngOnInit();
            this.falseVariable = true;
            this.modalService.dismissAll();
          } else {
            this.toastr.error(
              response.message || 'Failed to reject training',
              'Error'
            );
            this.falseVariable = false;
            this.modalService.dismissAll();
          }
        },
        error: (error) => {
          this.spinner.hide();
          const errorMessage =
            error.error?.message ||
            'An error occurred while sending training for rejection';
          this.toastr.error(errorMessage, 'Error');
          console.error('Error sending training for rejection:', error);
          this.falseVariable = false;
          this.modalService.dismissAll();
        },
      });
  }
  // rejectTrainingSchedule() {
  //   this.spinner.show();
  //   this.adminService
  //     .rejectTrainingSchedule(this.trainingDetails.id, this.rejectionRemark)
  //     .subscribe({
  //       next: (response) => {
  //         this.spinner.hide();
  //         if (response.success) {
  //           this.toastr.success(
  //             response.data.message || 'Training rejected successfully',
  //             'Success'
  //           );
  //           this.ngOnInit();
  //           this.falseVariable = true;
  //         } else {
  //           this.toastr.error(
  //             response.message || 'Failed to reject training',
  //             'Error'
  //           );
  //           this.falseVariable = false;
  //         }
  //       },
  //       error: (error) => {
  //         this.spinner.hide();
  //         const errorMessage =
  //           error.error?.message ||
  //           'An error occurred while rejecting training';
  //         this.toastr.error(errorMessage, 'Error');
  //         console.error('Error rejecting training:', error);
  //         this.falseVariable = false;
  //       },
  //     });
  // }

  approveTrainingSchedule() {
    this.spinner.show();
    this.adminService
      .approveTrainingSchedule(this.trainingDetails.id)
      .subscribe({
        next: (response) => {
          this.spinner.hide();
          if (response.success) {
            this.toastr.success(
              response.data.message ||
                'Training Schedule approved successfully',
              'Success'
            );
            this.ngOnInit();
            this.falseVariable = true;
            this.modalService.dismissAll();
          } else {
            this.toastr.error(
              response.message || 'Failed to approve training schedule',
              'Error'
            );
            this.falseVariable = false;
            this.modalService.dismissAll();
          }
        },
        error: (error) => {
          this.spinner.hide();
          const errorMessage =
            error.error?.message ||
            'An error occurred while approving training schedule';
          this.toastr.error(errorMessage, 'Error');
          console.error('Error:', error);
          this.falseVariable = false;
          this.modalService.dismissAll();
        },
      });
  }

  getTrainingInstituteId() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.trainingInstituteHeadId = user.trainingHeadId;
    }
  }
  getRole() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role;
      this.userId = user.OrganizationId;
    }
  }

  isValidHttpUrl(url: string): boolean {
    try {
      const u = new URL(url);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async toBlobUrl(raw?: string | null): Promise<string | null> {
    const path = (raw || '').toString().trim();
    if (!path) return null;

    if (this.isValidHttpUrl(path)) {
      return path;
    }

    try {
      let blob: Blob;
      if (path.startsWith('/')) {
        // Handle relative paths manually if needed, or consider adding to service
        const url = `${this.apiUrl}${path.replace(/^\/+/, '')}`;
        const token = localStorage.getItem('token');
        let headers: HttpHeaders | undefined;
        if (token) {
          headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        }
        blob = await firstValueFrom(
          this.http.get(url, { responseType: 'blob', headers })
        ) as Blob;
      } else {
        // Use service for filenames
        blob = await firstValueFrom(this.adminService.downloadInstituteImage(path));
      }
      return URL.createObjectURL(blob);
    } catch (err) {
      return this.isValidHttpUrl(path) ? path : null;
    }
  }

  async prepareTrainingScheduleUrl() {
    this.trainingScheduleUrl = null;
    if (this.trainingDetails?.trainingScheduleDetail) {
      this.isLoadingSchedule = true;
      try {
        this.trainingScheduleUrl = await this.toBlobUrl(
          this.trainingDetails.trainingScheduleDetail
        );
      } catch (error) {
        console.error('Error loading training schedule:', error);
      } finally {
        this.isLoadingSchedule = false;
      }
    }
  }

  handleTableAction(event: { action: string; item: any; index: number }): void {
    if (event.action === 'view') {
      this.traineeList = [];
      this.trainingDetails = event.item;
      this.prepareTrainingScheduleUrl();
      // Set current training details for API calls
      this.currentTrainingId = this.trainingDetails.id;

      this.fileNameTrainees = this.traineesFile;
      this.fileNameTrainees =
        this.fileNameTrainees +
        this.trainingDetails.trainingInstituteName +
        '_' +
        this.trainingDetails.trainingTitle +
        '_';
      this.trainingsService
        .getTraineeList(this.trainingDetails.id)
        .subscribe((res) => {
          this.traineeList = res.data;
          this.currentTrainingInstituteId =
            this.traineeList[0].trainingInstituteId || '';

        });

      this.modalService.open(this.trainingDetailsModal, {
        size: 'xl',
        scrollable: true,
        backdrop: 'static',
        keyboard: false,
      });
    } else if (event.action === 'downloadAllCertificates') {
      this.downloadAllCertificatesForTraining(event.item);
    } else if (event.action === 'downloadAllIdCards') {
      this.downloadAllIdCardsForTraining(event.item);
    } else if (event.action === 'approve') {
      this.spinner.show('modalSpinner');
      this.approveTrainee(event.item);
    } else if (event.action === 'reject') {
      this.selectedTraineeForReject = event.item;
      this.rejectForm.reset();
      this.rejectModalRef = this.modalService.open(this.rejectModal, {
        size: 'md',
        backdrop: 'static',
        keyboard: false,
      });
    } else if (event.action === 'download') {
      this.downloadCertificate(event.item);
    }
  }

  private async downloadAllCertificatesForTraining(training: any): Promise<void> {
    const trainingId = training?.id;
    if (!trainingId) {
      this.toastr.error('Training ID not available for download');
      return;
    }

    this.isTableLoading = true;
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
        };
        this.certificateUinForBulk = trainee.uin || 'UIN2025345780991';

        this.cdr.detectChanges();

        await new Promise((resolve) => setTimeout(resolve, 500));

        if (this.hiddenCertificate && this.hiddenCertificate.certificateContent) {
          const element = this.hiddenCertificate.certificateContent.nativeElement;
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
      this.isTableLoading = false;
      this.spinner.hide();
      this.certificateDataForBulk = null;
      this.cdr.detectChanges();
    }
  }

  private downloadAllIdCardsForTraining(training: any): void {
    const trainingId = training?.id;
    if (!trainingId) {
      this.toastr.error('Training ID not available for download');
      return;
    }

    const url = `${environment.apiUrl}training/downloadAllIdCards/${trainingId}`;
    window.open(url, '_blank');
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
    state: null,
    district: null,
  };

  parseDateString(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  }

  parseFilterDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  }

  applyFilters(): void {
    this.filteredData = this.trainingsList.filter((row) => {
      let dateMatch = true;
      if (this.filters.startDate || this.filters.endDate) {
        // Parse the training start and end dates
        // Assuming row.startDate and row.endDate are in "dd/MM/yyyy" format
        const rowStartDate = this.parseDateString(row.startDate);
        const rowEndDate = this.parseDateString(row.endDate);

        if (this.filters.startDate) {
          const filterStartDate = this.parseFilterDate(this.filters.startDate);
          if (filterStartDate) {
            // Check if training start date is on or after the filter start date
            if (rowStartDate) {
              // Reset time part for date-only comparison
              rowStartDate.setHours(0, 0, 0, 0);
              filterStartDate.setHours(0, 0, 0, 0);
              
              if (rowStartDate.getTime() < filterStartDate.getTime()) {
                dateMatch = false;
              }
            } else {
              // If training has no start date but filter requires one, it doesn't match
              dateMatch = false;
            }
          }
        }

        if (this.filters.endDate && dateMatch) {
          const filterEndDate = this.parseFilterDate(this.filters.endDate);
          if (filterEndDate) {
            // Check if training end date is on or before the filter end date
            // If row has no end date, we might assume it matches or not depending on requirements.
            // Here assuming if end date is missing, we can't verify it ends before filter end date, so exclude.
            if (rowEndDate) {
              // Reset time part for date-only comparison
              rowEndDate.setHours(0, 0, 0, 0);
              filterEndDate.setHours(0, 0, 0, 0);

              if (rowEndDate.getTime() > filterEndDate.getTime()) {
                dateMatch = false;
              }
            } else {
              // If training has no end date but filter requires one, be safe and exclude? 
              // Or check if start date is within range?
              // Let's assume strict filtering: needs to end before filter end date.
              // If data is clean, endDate should be present.
              // If not present, maybe we should rely on startDate? 
              // But user explicitly complained about end dates outside range.
              dateMatch = false;
            }
          }
        }
      }

      return (
        (!this.filters.trainingTitle ||
          row.trainingTitle === this.filters.trainingTitle) &&
        (!this.filters.scheme || row.scheme === this.filters.scheme) &&
        (!this.filters.trainingInstituteName ||
          row.trainingInstituteName === this.filters.trainingInstituteName) &&
        (!this.filters.trainerName ||
          row.trainerName === this.filters.trainerName) &&
        (!this.filters.location || row.location === this.filters.location) &&
        (!this.filters.state || row.venueState === this.filters.state) &&
        (!this.filters.district ||
          row.venueDistrict === this.filters.district) &&
        dateMatch &&
        (!this.filters.status || row.status === this.filters.status)
      );
    });

    this.filteredData.forEach((ele) => {
      console.log(ele.trainingTitle);
    });
  }
  uniqueValuesTrainingTitle(): any[] {
    return [
      ...new Set(this.trainingsList.map((item) => item['trainingTitle'])),
    ];
  }

  uniqueValuesDistrict(): any[] {
    // If state filter is applied, only show districts from that state
    const dataToFilter = this.filters.state
      ? this.trainingsList.filter(
          (item) => item['venueState'] === this.filters.state
        )
      : this.trainingsList;

    return [...new Set(dataToFilter.map((item) => item['venueDistrict']))];
  }

  uniqueValuesState(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['venueState']))];
  }

  onStateFilterChange(): void {
    // Clear district filter when state changes
    this.filters.district = null;
    // Apply filters
    this.applyFilters();
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
    // Return predefined status values for filtering
    return [
      'NEW',
      'Recommended by Institute Head',
      'Rejected by Institute Head',
      'Approved by State Head',
      'Rejected by State Head',
      'APPROVED BY ORGANIZATION',
      'REJECTED BY ORGANIZATION',
      'Trainees details uploaded',
      'Pending for State Head Approval',
      'Certificate Approved / Rejected',
    ];
  }

  reset() {}

  open() {}
  get formControls() {
    return this.trainingForm.controls;
  }

  keyFunc() {}

  approveTrainee(trainee: any): void {
    const payload = {
      // trainingInstituteId: this.currentTrainingInstituteId,
      trainingInstituteId: this.trainingInstituteHeadId,
      trainingId: this.currentTrainingId,
      traineeIds: [trainee.id],
    };

    this.isTableLoading = true;
    this.spinner.show('modalSpinner');
    this.adminService.approveTrainees(payload).subscribe({
      next: (response) => {
        this.isTableLoading = false;
        this.spinner.hide('modalSpinner');
        if (response.success) {
          // Update trainee status based on user role
          if (this.userRole === 3) {
            trainee.status = 'Recommended by Institute Head';
          } else {
            trainee.status = 'APPROVED';
          }

          this.toastr.success(
            response.data.message || 'Trainee approved successfully',
            'Success'
          );

          // Refresh the trainee list to reflect updated status
          this.refreshTraineeList();
        } else {
          this.toastr.error(
            response.message || 'Failed to approve trainee',
            'Error'
          );
        }
      },
      error: (error) => {
        this.isTableLoading = false;
        this.spinner.hide('modalSpinner');
        const errorMessage =
          error.error?.message || 'An error occurred while approving trainee';
        this.toastr.error(errorMessage, 'Error');
        console.error('Error approving trainee:', error);
      },
    });
  }

  rejectTrainee(): void {
    if (this.rejectForm.valid) {
      this.isTableLoading = true;
      const remarks = this.rejectForm.get('remarks')?.value;

      // Check if this is bulk rejection or individual rejection
      if (this.selectedTraineesForBulkReject.length > 0) {
        this.bulkRejectTraineesWithRemarks(
          this.selectedTraineesForBulkReject,
          remarks
        );
      } else if (this.selectedTraineeForReject) {
        const payload = {
          trainingInstituteId: this.currentTrainingInstituteId,
          trainingId: this.currentTrainingId,
          traineeIds: [this.selectedTraineeForReject.id],
          rejectionRemarks: remarks,
        };

        this.spinner.show('modalSpinner');
        this.adminService.rejectTrainees(payload).subscribe({
          next: (response) => {
            this.spinner.hide('modalSpinner');
            if (response.success) {
              // Update trainee status based on user role
              if (this.userRole === 3) {
                this.selectedTraineeForReject.status =
                  'Rejected by Institute Head';
              } else {
                this.selectedTraineeForReject.status = 'REJECTED';
              }
              this.selectedTraineeForReject.remarks = remarks;
              this.toastr.success(
                response.data.message || 'Trainee rejected successfully',
                'Success'
              );

              // Refresh the trainee list to reflect updated status
              this.refreshTraineeList();
            } else {
              this.toastr.error(
                response.message || 'Failed to reject trainee',
                'Error'
              );
            }
            this.isTableLoading = false;
            // Close only the reject modal, not all modals
            if (this.rejectModalRef) {
              this.rejectModalRef.close();
              this.rejectModalRef = null;
            }
            this.selectedTraineeForReject = null;
            this.rejectForm.reset();
          },
          error: (error) => {
            this.spinner.hide('modalSpinner');
            const errorMessage =
              error.error?.message ||
              'An error occurred while rejecting trainee';
            this.isTableLoading = false;
            this.toastr.error(errorMessage, 'Error');
            console.error('Error rejecting trainee:', error);
            // Close only the reject modal, not all modals
            if (this.rejectModalRef) {
              this.rejectModalRef.close();
              this.rejectModalRef = null;
            }
            this.selectedTraineeForReject = null;
            this.rejectForm.reset();
          },
        });
      }
    }
  }

  refreshTraineeList(): void {
    // Refresh the trainee list to get updated statuses
    this.trainingsService
      .getTraineeList(this.currentTrainingId)
      .subscribe((res) => {
        this.traineeList = res.data;
      });
    this.selectedItems = new Set();
  }

  downloadCertificate(trainee: any): void {
    this.selectedTraineeForCertificate = trainee;

    // Call the getCertificateDetails API
    this.trainingsService
      .getCertificateDetails(
        trainee.uin || '',
        trainee.email || '',
        trainee.contactNumber || ''
      )
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.certificateData = response.data;
            this.certificateData.location = response.data.venueBlock
              ? response.data.venueBlock
              : '' + response.data.venueBlock && response.data.venueDistrict
              ? ', '
              : '' + response.data.venueDistrict
              ? response.data.venueDistrict
              : '' + response.data.venueDistrict && response.data.venueState
              ? ', '
              : '' + response.data.venueState
              ? response.data.venueState
              : '';
            // Open certificate modal
            this.modalService.open(this.certificateModal, {
              size: 'xl',
              scrollable: true,
              backdrop: 'static',
              keyboard: false,
            });
          } else {
            this.toastr.error(
              response.message || 'Failed to load certificate details',
              'Error'
            );
          }
        },
        error: (error) => {
          const errorMessage =
            error.error?.message ||
            'An error occurred while loading certificate details';
          this.toastr.error(errorMessage, 'Error');
          console.error('Error loading certificate details:', error);
        },
      });
  }

  // Check if all trainees are approved to show bulk download button
  get allTraineesApproved(): boolean {
    return (
      this.traineeList.length > 0 &&
      this.traineeList.every((trainee) => trainee.status === 'APPROVED')
    );
  }

  get rejectFormControls() {
    return this.rejectForm.controls;
  }

  onRejectModalDismiss(): void {
    this.selectedTraineesForBulkReject = [];
    this.selectedTraineeForReject = null;
    this.rejectForm.reset();
  }

  // Handle bulk actions
  handleBulkAction(event: { action: string; items: any[] }): void {
    const { action, items } = event;

    if (action === 'bulkApprove') {
      this.bulkApproveTrainees(items);
    } else if (action === 'bulkReject') {
      // Filter out already approved or rejected trainees to prevent re-rejection
      const eligibleTraineesForReject = items.filter(
        (trainee) =>
          trainee.status !== 'APPROVED' &&
          trainee.status !== 'REJECTED' &&
          trainee.status !== 'Approved by State Head' &&
          trainee.status !== 'APPROVED BY ORGANIZATION' &&
          trainee.status !== 'Rejected by Institute Head' &&
          trainee.status !== 'Certificate Issued & downloaded'
      );

      if (eligibleTraineesForReject.length === 0) {
        this.toastr.warning(
          'No eligible trainees to reject. Please select trainees that are not already approved or rejected.',
          'Warning'
        );
        return;
      }

      this.selectedTraineesForBulkReject = eligibleTraineesForReject;
      this.rejectForm.reset();
      this.modalService.open(this.rejectModal, { centered: true });
    }
  }

  bulkApproveTrainees(trainees: any[]): void {
    const eligibleTrainees = trainees.filter(
      (trainee) => trainee.status !== 'APPROVED'
    );

    if (eligibleTrainees.length === 0) {
      this.toastr.warning('No eligible trainees to approve');
      return;
    }

    this.isTableLoading = true;
    const payload = {
      trainingInstituteId: this.currentTrainingInstituteId,
      trainingId: this.currentTrainingId,
      traineeIds: eligibleTrainees.map((trainee) => trainee.id),
    };

    this.adminService.approveTrainees(payload).subscribe({
      next: (response) => {
        this.isTableLoading = false;
        if (response.success) {
          // Update status for all approved trainees based on user role
          eligibleTrainees.forEach((trainee) => {
            if (this.userRole === 3) {
              trainee.status = 'Recommended by Institute Head';
            } else {
              trainee.status = 'APPROVED';
            }
          });

          this.toastr.success(
            `${eligibleTrainees.length} trainees approved successfully!`
          );

          // Clear selected items in the table
          if (this.traineeTable) {
            this.traineeTable.clearSelectedItems();
          }

          // Refresh the trainee list
          this.refreshTraineeList();
        } else {
          this.toastr.error(
            response.message || 'Failed to approve trainees',
            'Error'
          );
        }
      },
      error: (error) => {
        this.isTableLoading = false;
        this.toastr.error('Error approving trainees');
        console.error('Bulk approve error:', error);
      },
    });
  }

  bulkRejectTrainees(trainees: any[]): void {
    // This method is no longer used directly - bulk rejection now goes through the modal
    // Keeping for backward compatibility if needed
    this.selectedTraineesForBulkReject = trainees;
    this.rejectForm.reset();
    this.rejectModalRef = this.modalService.open(this.rejectModal, {
      centered: true,
    });
  }

  bulkRejectTraineesWithRemarks(trainees: any[], remarks: string): void {
    this.isTableLoading = true;

    // Filter trainees that can be rejected (not already approved or rejected)
    const eligibleTrainees = trainees.filter(
      (trainee) =>
        trainee.status !== 'APPROVED' && trainee.status !== 'REJECTED'
    );

    if (eligibleTrainees.length === 0) {
      this.isTableLoading = false;
      this.toastr.warning('No eligible trainees to reject', 'Warning');
      if (this.rejectModalRef) {
        this.rejectModalRef.close();
        this.rejectModalRef = null;
      }
      this.selectedTraineesForBulkReject = [];
      return;
    }

    const payload = {
      trainingInstituteId: this.currentTrainingInstituteId,
      trainingId: this.currentTrainingId,
      traineeIds: eligibleTrainees.map((trainee) => trainee.id),
      rejectionRemarks: remarks,
    };

    this.adminService.rejectTrainees(payload).subscribe({
      next: (response) => {
        this.isTableLoading = false;

        if (response.success) {
          // Update status for all rejected trainees based on user role
          eligibleTrainees.forEach((trainee) => {
            if (this.userRole === 3) {
              trainee.status = 'Rejected by Institute Head';
            } else {
              trainee.status = 'REJECTED';
            }
            trainee.remarks = remarks;
          });

          // Show success message
          this.toastr.success(
            `${eligibleTrainees.length} trainee(s) rejected successfully`,
            'Success'
          );

          // Clear selected items in the table
          if (this.traineeTable) {
            this.traineeTable.clearSelectedItems();
          }

          // Refresh the trainee list
          this.refreshTraineeList();
        } else {
          this.toastr.error(
            response.message || 'Failed to reject trainees',
            'Error'
          );
        }

        // Always close modal and cleanup after API response (success or failure)
        if (this.rejectModalRef) {
          this.rejectModalRef.close();
          this.rejectModalRef = null;
        }
        this.selectedTraineesForBulkReject = [];
        this.rejectForm.reset();
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'An error occurred while rejecting trainees';
        this.isTableLoading = false;
        this.toastr.error(errorMessage, 'Error');
        console.error('Error rejecting trainees:', error);

        // Close modal and cleanup even on error
        if (this.rejectModalRef) {
          this.rejectModalRef.close();
          this.rejectModalRef = null;
        }
        this.selectedTraineesForBulkReject = [];
        this.rejectForm.reset();
      },
    });
  }

  // Enhanced Filter Methods for Modern UI
  hasActiveFilters(): boolean {
    return !!(
      this.filters.scheme ||
      this.filters.state ||
      this.filters.district ||
      this.filters.startDate ||
      this.filters.endDate ||
      this.filters.status
    );
  }

  clearAllFilters(): void {
    this.filters = {
      trainingTitle: null,
      scheme: null,
      trainingInstituteName: null,
      trainerName: null,
      location: null,
      startDate: null,
      endDate: null,
      status: null,
      state: null,
      district: null,
    };
    this.applyFilters();
  }

  removeFilter(filterKey: string): void {
    if (this.filters.hasOwnProperty(filterKey)) {
      (this.filters as any)[filterKey] = null;
      this.applyFilters();
    }
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('new')) return 'status-new';
    if (statusLower.includes('validated') || statusLower.includes('pending'))
      return 'status-validated';
    if (statusLower.includes('approved')) return 'status-approved';
    if (statusLower.includes('rejected')) return 'status-rejected';
    if (statusLower.includes('uploaded')) return 'status-pending';
    return '';
  }

  getStatusIcon(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('new')) return 'bi-circle';
    if (statusLower.includes('validated') || statusLower.includes('pending'))
      return 'bi-clock';
    if (statusLower.includes('approved')) return 'bi-check-circle';
    if (statusLower.includes('rejected')) return 'bi-x-circle';
    if (statusLower.includes('uploaded')) return 'bi-upload';
    return 'bi-circle';
  }
}
