import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/training-admin.service';
import { CertificateLayoutComponent } from '../../certificate-layout/certificate-layout.component';
import { NewCertificateLayoutComponent } from '../../new-certificate-layout/new-certificate-layout.component';

@Component({
  selector: 'app-verify-trainings',
  imports: [
    CommonModule,
    BreadcrumbComponent,
    TableComponent,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    NewCertificateLayoutComponent,
  ],
  templateUrl: './verify-trainings.component.html',
  styleUrl: './verify-trainings.component.css',
})
export class VerifyTrainingsComponent {
  trainingDetails: any;
  @ViewChild('trainingDetailsModal')
  trainingDetailsModal!: ElementRef;
  submitted: Boolean = false;
  trainingForm!: FormGroup;
  isExportCSV: Boolean = true;
  isExportPdf: Boolean = true;
  isBulkCertDownload: Boolean = false;
  fileName: String = 'All_trainings_';
  fileNameTrainees: String = 'All_trainee_List_';
  traineesFile: String = 'All_trainee_List_';
  tableName: string = 'Verify-Trainings';
  pdfHeaders: Array<string> = [
    'Sr.No.',
    'Training Title',
    'Scheme',
    'Training Institute',
    'Trainer Name',
    'Location',
    'Training Date',
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
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Verify Trainings' },
  ];
  tableColumns: TableColumn[] = [
    { key: 'trainingTitle', header: 'Training Title' },
    { key: 'scheme', header: 'Scheme' },
    { key: 'trainingInstituteName', header: 'Training Institute' },
    { key: 'trainerName', header: 'Trainer Name' },

    { key: 'location', header: 'Location' },
    { key: 'trainingDate', header: 'Training Date' },
    { key: 'status', header: 'Status' },
  ];

  tableActions: TableAction[] = [
    {
      name: 'view',
      icon: 'bi bi-shield-fill-check',
      class: 'btn-info',
      title: 'View',
    },
    // { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download' },
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
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
    { key: 'gender', header: 'Gender' },
    { key: 'contactNumber', header: 'Contact' },
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status' },
  ];

  // tableActionsTrainee: TableAction[] = [
  //   //{ name: 'download', icon: 'bi bi-eye', class: 'btn-info', title: 'Download certificate' },
  //   { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download certificate' },
  // ];

  tableActionsTrainee: TableAction[] = [
    {
      name: 'verify',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Verify',
      condition: (row: any) => row.status === 'IN PROGRESS',
    },
    {
      name: 'cancel',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Cancel',
      condition: (row: any) => row.status === 'IN PROGRESS',
    },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-info',
      title: 'Download certificate',
      condition: (row: any) => row.status === 'APPROVED',
    },
  ];

  bulkActionsTrainee: TableAction[] = [
    {
      name: 'bulkVerify',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Bulk Verify',
    },
    {
      name: 'bulkCancel',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Bulk Cancel',
    },
  ];

  enableMultiSelectTrainee: boolean = true;

  selectedTraineesForbulkCancel: any[] = [];
  eligibleTraineesLIst: any[] = [];
  cancelForm!: FormGroup;
  currentTrainingInstituteId: string = '';
  @ViewChild('cancelModal')
  cancelModal!: ElementRef;

  currentTrainingId: number = 0;

  selectedTraineeForCancel: any = null;
  selectedTraineeForCertificate: any = null;
  certificateData: any = null;
  @ViewChild('certificateModal')
  certificateModal!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private trainingsService: TrainingService,
    private toastr: ToastrService,
    private adminService: AdminService
  ) {}
  filteredData = [...this.trainingsList];

  ngOnInit(): void {
    this.trainingForm = this.formBuilder.group({
      id: [''],
      comment: ['', [Validators.required]],
      status: ['', [Validators.required]],
    });
    this.cancelForm = this.formBuilder.group({
      remarks: ['', [Validators.required]],
    });

    const sessionData = sessionStorage.getItem('user');
    let trainingHeadId = '';

    if (sessionData) {
      try {
        const userData = JSON.parse(sessionData);
        trainingHeadId = userData.trainingHeadId || '';
      } catch (error) {
        console.error('Error parsing session data:', error);
        this.toastr.error('Session data error. Please login again.', 'Error');
        // this.isLoading = false;
        // return;
      }
    }

    if (!trainingHeadId) {
      this.toastr.error(
        'Training Head ID not found. Please login again.',
        'Error'
      );
      // this.isLoading = false;
      // return;
    } else {
      this.trainingsService.getAllTrainings(trainingHeadId).subscribe((res) => {
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
          ele['trainingDate'] = datePipe.transform(
            ele['trainingDate'],
            'dd/MM/yyyy'
          )!;
          this.trainingsList[index] = ele;
          index++;
        });
      });
    }
  }

  handleTableAction(event: { action: string; item: any; index: number }): void {
    // const modal = new this.bootstrap.Modal(this.trainingDetailsModal.nativeElement);
    //modal.show();
    if (event.action === 'view') {
      this.traineeList = [];
      this.trainingDetails = event.item;
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
        });

      this.modalService.open(this.trainingDetailsModal, {
        size: 'xl',
        scrollable: true,
        backdrop: 'static',
        keyboard: false,
      });
    } else if (event.action === 'verify') {
      this.verifyTrainee(event.item);
    } else if (event.action === 'cancel') {
      this.selectedTraineeForCancel = event.item;
      this.cancelForm.reset();
      this.modalService.open(this.cancelModal, {
        size: 'md',
        backdrop: 'static',
        keyboard: false,
      });
    } else if (event.action === 'download') {
      this.downloadCertificate(event.item);
    }
  }

  filters = {
    trainingTitle: null,
    scheme: null,
    trainingInstituteName: null,
    trainerName: null,
    location: null,
    district: null,
    trainingDate: null,
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
        (!this.filters.district ||
          row.venueDistrict === this.filters.district) &&
        (!this.filters.trainingDate ||
          row.trainingDate === this.filters.trainingDate) &&
        (!this.filters.status || row.status === this.filters.status)

        // (!this.filters.sync_status || row.sync_status.toString() === this.filters.sync_status.toString()) &&
      );
    });

    this.filteredData.forEach((ele) => {
      // console.log(ele.trainingTitle);
    });
  }
  uniqueValuesTrainingTitle(): any[] {
    return [
      ...new Set(this.trainingsList.map((item) => item['trainingTitle'])),
    ];
  }

  uniqueValuesTrainingDate(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['trainingDate']))];
  }

  uniqueValuesScheme(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['scheme']))];
  }

  uniqueValuesDistrict(): any[] {
    return [
      ...new Set(this.trainingsList.map((item) => item['venueDistrict'])),
    ];
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

  reset() {}

  open() {}
  get formControls() {
    return this.trainingForm.controls;
  }

  keyFunc() {}

  modalDismiss() {
    this.modalService.dismissAll();
    this.ngOnInit();
  }

  handleBulkAction(event: { action: string; items: any[] }): void {
    const { action, items } = event;

    if (action === 'bulkVerify') {
      this.bulkVerifyTrainees(items);
    } else if (action === 'bulkCancel') {
      this.selectedTraineesForbulkCancel = items;
      this.cancelForm.reset();
      this.modalService.open(this.cancelModal, { centered: true });
    }
  }

  updateTRaineesList() {
    this.trainingsService
      .getTraineeList(this.trainingDetails.id)
      .subscribe((res) => {
        this.traineeList = res.data;
      });
  }
  bulkVerifyTrainees(trainees: any[]): void {
    const eligibleTrainees = trainees
      .filter((trainee) => trainee.status == 'IN PROGRESS')
      .map((trainee) => trainee.id);

    if (eligibleTrainees.length === 0) {
      this.toastr.warning('No eligible trainees to approve');
      return;
    }

    const payload = eligibleTrainees;

    this.adminService.verifyTrainees(payload).subscribe({
      next: (response) => {
        this.toastr.success(
          `${eligibleTrainees.length} trainees verified successfully!`
        );
        // Refresh the trainee list
        this.trainingsService
          .getTraineeList(this.trainingDetails.id)
          .subscribe((res) => {
            this.traineeList = res.data;
          });
      },
      error: (error) => {
        this.toastr.error('Error approving trainees');
        console.error('Bulk approve error:', error);
      },
    });
  }

  bulkCancelTrainees(trainees: any[]): void {
    // This method is no longer used directly - bulk cancellation now goes through the modal
    // Keeping for backward compatibility if needed
    this.selectedTraineesForbulkCancel = trainees;
    this.cancelForm.reset();
    this.modalService.open(this.cancelModal, { centered: true });
  }

  bulkCancelTraineesWithRemarks(trainees: any[], remarks: string): void {
    // Filter trainees that can be cancelled (not already verified or cancelled)
    const eligibleTrainees = trainees.filter(
      (trainee) => trainee.status == 'IN PROGRESS'
    );
    this.eligibleTraineesLIst = eligibleTrainees;

    if (eligibleTrainees.length === 0) {
      this.toastr.warning('No eligible trainees to cancel', 'Warning');
      this.modalService.dismissAll();
      this.selectedTraineesForbulkCancel = [];
      return;
    }

    const payload = {
      traineeIds: eligibleTrainees.map((trainee) => trainee.id),
      cancelRemarks: remarks,
    };

    this.adminService.cancelTrainees(payload).subscribe({
      next: (response) => {
        if (response.success) {
          // Update status for all cancelled trainees
          eligibleTrainees.forEach((trainee) => {
            trainee.status = 'CANCELLED';
            trainee.remarks = remarks;
          });
          this.toastr.success(
            `${eligibleTrainees.length} trainee(s) cancelled successfully`,
            'Success'
          );
          // Refresh the trainee list
          this.trainingsService
            .getTraineeList(this.trainingDetails.id)
            .subscribe((res) => {
              this.traineeList = res.data;
            });
        } else {
          this.toastr.error(
            response.message || 'Failed to cancel trainees',
            'Error'
          );
        }
        this.modalService.dismissAll();
        this.selectedTraineesForbulkCancel = [];
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'An error occurred while cancelling trainees';
        this.toastr.error(errorMessage, 'Error');
        console.error('Error cancelling trainees:', error);
        this.modalService.dismissAll();
        this.selectedTraineesForbulkCancel = [];
      },
    });
  }

  verifyTrainee(trainee: any): void {
    debugger;
    const payload = [trainee.id];

    this.adminService.verifyTrainees(payload).subscribe({
      next: (response) => {
        if (response.success) {
          trainee.status = 'VERIFIED';
          this.updateTRaineesList();
          this.toastr.success(
            response.data.message || 'Trainee Verified successfully',
            'Success'
          );
        } else {
          this.toastr.error(
            response.message || 'Failed to verify trainee',
            'Error'
          );
        }
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'An error occurred while verifying trainee';
        this.toastr.error(errorMessage, 'Error');
        console.error('Error verifying trainee:', error);
      },
    });
  }

  cancelTrainee(): void {
    if (this.cancelForm.valid) {
      const remarks = this.cancelForm.get('remarks')?.value;

      // Check if this is bulk cancellation or individual cancellation
      if (this.selectedTraineesForbulkCancel.length > 0) {
        this.bulkCancelTraineesWithRemarks(
          this.selectedTraineesForbulkCancel,
          remarks
        );
      } else if (this.selectedTraineeForCancel) {
        const payload = {
          traineeIds: [this.selectedTraineeForCancel.id],
          cancelRemarks: remarks,
        };

        this.adminService.cancelTrainees(payload).subscribe({
          next: (response) => {
            if (response.success) {
              this.selectedTraineeForCancel.status = 'CANCELLED';
              this.selectedTraineeForCancel.remarks = remarks;
              this.toastr.success(
                response.data.message || 'Trainee cancelled successfully',
                'Success'
              );
            } else {
              this.toastr.error(
                response.message || 'Failed to cancel trainee',
                'Error'
              );
            }
            this.modalService.dismissAll();
            this.selectedTraineeForCancel = null;
          },
          error: (error) => {
            const errorMessage =
              error.error?.message ||
              'An error occurred while cancelling trainee';
            this.toastr.error(errorMessage, 'Error');
            console.error('Error cancelling trainee:', error);
            this.modalService.dismissAll();
            this.selectedTraineeForCancel = null;
          },
        });
      }
    }
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
  get cancelFormControls() {
    return this.cancelForm.controls;
  }
  onCancelModalDismiss(): void {
    this.selectedTraineesForbulkCancel = [];
    this.selectedTraineeForCancel = null;
    this.cancelForm.reset();
  }
}
