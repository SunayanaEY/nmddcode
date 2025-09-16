import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CertificateLayoutComponent } from '../../certificate-layout/certificate-layout.component';

@Component({
  selector: 'app-all-trainings-admin',
  imports: [
    CommonModule,
    BreadcrumbComponent,
    TableComponent,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    CertificateLayoutComponent,
    NgxSpinnerModule,
  ],
  templateUrl: './all-trainings-admin.component.html',
  styleUrl: './all-trainings-admin.component.css',
  // encapsulation: ViewEncapsulation.None
})
export class AllTrainingsAdminComponent {
  @ViewChild('certificateContent', { static: false })
  certificateContent!: ElementRef;
  trainingDetails: any;
  @ViewChild('trainingDetailsModal')
  trainingDetailsModal!: ElementRef;
  @ViewChild('rejectModal')
  rejectModal!: ElementRef;
  @ViewChild('certificateModal')
  certificateModal!: ElementRef;
  submitted: Boolean = false;
  certificateZip = new JSZip();
  certificateData: any = null;
  selectedTraineeForCertificate: any = null;
  trainingForm!: FormGroup;
  rejectForm!: FormGroup;
  selectedTraineeForReject: any = null;
  selectedTraineesForBulkReject: any[] = [];
  currentTrainingInstituteId: string = '';
  currentTrainingId: number = 0;
  isExportCSV: Boolean = true;
  isExportPdf: Boolean = true;
  isBulkCertDownload: Boolean = true;
  bulkCertificateDownload: any[] = [];
  trainingInstituteHeadId: any = null;
  userRole: any;
  fileName: String = 'All_trainings_';
  fileNameTrainees: String = 'All_trainee_List_';
  traineesFile: String = 'All_trainee_List_';
  falseVariable:boolean = false;
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
    { label: 'Approve/Reject Trainings' },
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
    { name: 'view', icon: 'bi bi-eye', class: 'btn-info', title: 'View' },
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

  tableActionsTrainee: TableAction[] = [
    {
      name: 'approve',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Approve',
      condition: (row: any) => {
        // For Institute Head (role 3), only show approve button for TRAINEE_UPLOADED status
        if (this.userRole === 3) {
          return row.status === 'TRAINEE_UPLOADED';
        }
        // For other roles, show approve button for TRAINEE_UPLOADED or VALIDATED_BY_INSTITUTE_HEAD
        return row.status === 'TRAINEE_UPLOADED' || row.status === 'VALIDATED_BY_INSTITUTE_HEAD';
      },
    },
    {
      name: 'reject',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Reject',
      condition: (row: any) => {
        // For Institute Head (role 3), only show reject button for TRAINEE_UPLOADED status
        if (this.userRole === 3) {
          return row.status === 'TRAINEE_UPLOADED';
        }
        // For other roles, show reject button for TRAINEE_UPLOADED or VALIDATED_BY_INSTITUTE_HEAD
        return row.status === 'TRAINEE_UPLOADED' || row.status === 'VALIDATED_BY_INSTITUTE_HEAD';
      },
    },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-info',
      title: 'Download certificate',
      condition: (row: any) => row.status === 'APPROVED_BY_STATE_ADMIN',
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
        // For Institute Head (role 3), only show bulk approve if there are TRAINEE_UPLOADED status items
        if (this.userRole === 3) {
          return rows.some(row => row.status === 'TRAINEE_UPLOADED');
        }
        // For other roles, show bulk approve if there are eligible items
        return rows.some(row => row.status === 'TRAINEE_UPLOADED' || row.status === 'VALIDATED_BY_INSTITUTE_HEAD');
      },
    },
    {
      name: 'bulkReject',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Bulk Reject',
      condition: (rows: any[]) => {
        // For Institute Head (role 3), only show bulk reject if there are TRAINEE_UPLOADED status items
        if (this.userRole === 3) {
          return rows.some(row => row.status === 'TRAINEE_UPLOADED');
        }
        // For other roles, show bulk reject if there are eligible items
        return rows.some(row => row.status === 'TRAINEE_UPLOADED' || row.status === 'VALIDATED_BY_INSTITUTE_HEAD');
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
    private spinner: NgxSpinnerService
  ) {}
  filteredData = [...this.trainingsList];

  ngOnInit(): void {
    this.getTrainingInstituteId();
    this.getRole();
    if(this.userRole === 1){
       this.tableActionsTrainee = [
       {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-info',
      title: 'Download certificate',
      condition: (row: any) => row.status === 'APPROVED_BY_STATE_ADMIN',
    }]
    }
    if(this.userRole === 3)
    {
      this.tableActionsTrainee = [
    {
      name: 'approve',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Approve',
      condition: (row: any) => row.status === 'TRAINEE_UPLOADED',
    },
    {
      name: 'reject',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Reject',
      condition: (row: any) => row.status === 'TRAINEE_UPLOADED',
    },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-info',
      title: 'Download certificate',
      condition: (row: any) => row.status === 'APPROVED',
    },
  ];
    }
    
    if(this.userRole === 5)
    {
      this.tableActionsTrainee = [
    {
      name: 'approve',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Approve',
      condition: (row: any) => row.status === 'VALIDATED_BY_INSTITUTE_HEAD',
    },
    {
      name: 'reject',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Reject',
      condition: (row: any) => row.status === 'VALIDATED_BY_INSTITUTE_HEAD',
    },
    {
      name: 'download',
      icon: 'bi bi-download',
      class: 'btn-info',
      title: 'Download certificate',
      condition: (row: any) => row.status === 'APPROVED_BY_STATE_ADMIN',
    },
  ];
  
      this.bulkActionsTrainee = [
    {
      name: 'bulkApprove',
      icon: 'bi bi-check-circle',
      class: 'btn-success',
      title: 'Bulk Approve',
      condition: (rows: any[]) => {
        return rows.some(row => row.status === 'VALIDATED_BY_INSTITUTE_HEAD');
      },
    },
    {
      name: 'bulkReject',
      icon: 'bi bi-x-circle',
      class: 'btn-danger',
      title: 'Bulk Reject',
      condition: (rows: any[]) => {
        return rows.some(row => row.status === 'VALIDATED_BY_INSTITUTE_HEAD');
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
      this.trainingsService
        .getAllTrainings(this.trainingInstituteHeadId)
        .subscribe((res) => {
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
    } else {
      this.trainingsService.getAllTraining().subscribe((res) => {
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

  sendForApproval() {
    this.spinner.show();
    this.adminService.sendTrainingToValidate(this.trainingDetails.id).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.toastr.success(
            response.data.message || 'Training sent for approval successfully',
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
          error.error?.message || 'An error occurred while sending training for approval';
        this.toastr.error(errorMessage, 'Error');
        console.error('Error sending training for approval:', error);
        this.falseVariable = false;
        this.modalService.dismissAll();
      },
    });

  }
  rejectTrainingSchedule() {
    this.spinner.show();
    this.adminService.rejectTrainingSchedule(this.trainingDetails.id).subscribe({
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
          error.error?.message || 'An error occurred while sending training for rejection';
        this.toastr.error(errorMessage, 'Error');
        console.error('Error sending training for rejection:', error);
        this.falseVariable = false;
        this.modalService.dismissAll();
      },
    });

  }

  approveTrainingSchedule() {
    this.spinner.show();
    this.adminService.approveTrainingSchedule(this.trainingDetails.id).subscribe({
      next: (response) => {
        this.spinner.hide();
        if (response.success) {
          this.toastr.success(
            response.data.message || 'Training Schedule approved successfully',
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
          error.error?.message || 'An error occurred while approving training schedule';
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
    }
  }

  handleTableAction(event: { action: string; item: any; index: number }): void {
    console.log('Action:', event.action, 'Item:', event.item);

    if (event.action === 'view') {
      this.traineeList = [];
      this.trainingDetails = event.item;
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
          this.traineeList.forEach((trainee) => {
            if (
              trainee.uin != null &&
              trainee.uin != '' &&
              trainee.uin != undefined
            ) {
              let certDetail = {
                id: trainee.id,
                logoPath1: this.trainingDetails.logoPath1,
                logoPath2: this.trainingDetails.logoPath2,
                logoPath3: this.trainingDetails.logoPath3,
                name: trainee.name,
                trainingInstituteName:
                  this.trainingDetails.trainingInstituteName,
                trainingTitle: this.trainingDetails.trainingTitle,
                trainingDate: this.trainingDetails.trainingDate,
                location: this.trainingDetails.location,
                signatures: this.trainingDetails.signatures,
                uin: trainee.uin,
              };

              this.bulkCertificateDownload.push(certDetail);
            }
          });
        });

      this.modalService.open(this.trainingDetailsModal, {
        size: 'xl',
        scrollable: true,
        backdrop: 'static',
        keyboard: false,
      });
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

  async download(event: { action: string }) {
    this.certificateZip = new JSZip();
    let promise: any[] = [];
    let index = 0;
    this.bulkCertificateDownload.forEach(async (cert) => {
      const targetDiv = document.getElementById('certificate')!;
      targetDiv.innerHTML = `<div class="certificate-wrapper" #certificateContent>
  <div class="certificate-border">
    <div class="certificate-logos">
      <img src="${cert.logoPath1}" alt="Logo 1" crossorigin="anonymous" />
      <img *ngIf="${cert.logoPath2}" src="${cert.logoPath2}" alt="Logo 2" crossorigin="anonymous" />
      <img *ngIf="${cert.logoPath3}"  src="${cert.logoPath3}" alt="Logo 3" crossorigin="anonymous" />
    </div>
    <div class="certificate-header">
      <h2>Certificate of Completion</h2>
      <p class="subtitle">This Certificate Is Proudly Presented To</p>
      <h1 class="trainee-name">${cert?.name}</h1>
    </div>

    <div class="certificate-body">
      <p>
        From <strong>${cert?.trainingInstituteName}</strong> has successfully
        completed the training program
        <strong>${cert?.trainingTitle}</strong> on
        <strong>${cert?.trainingDate}</strong
        >, conducted at <strong>${cert?.location}</strong
        >.
      </p>
    </div>

    <div class="certificate-footer">
      <div class="signatures">
        <div class="signature">
        <p><img src="${cert.signatures[0].signatorySignaturePath}" alt="Logo 1" crossorigin="anonymous" /></p>
         <p>_____________________</p>
          <p>${cert.signatures[0].signatoryName}</p>
          <p>${cert.signatures[0].signatoryDesignation}</p>
          <p>${cert.signatures[0].signatoryOrganization}</p>
        </div>

        <div class="qr-code">
          <qrcode
            [qrdata]="qrData"
            [width]="100"
            [errorCorrectionLevel]="'M'"
          ></qrcode>
          <p class="uid">UIN: ${cert.uin}</p>
        </div>
        <div class="signature" [hidden]="${cert.signatures.length}>1">
          <p><img src="${cert.signatures[1]?.signatorySignaturePath}" alt="Logo 1" crossorigin="anonymous" /></p>
           <p>_____________________</p>
          <p>${cert.signatures[1]?.signatoryName}</p>
          <p>${cert.signatures[1]?.signatoryDesignation}</p>
          <p>${cert.signatures[1]?.signatoryOrganization}</p>
        </div>
      </div>
    </div>
  </div>

</div>
`;
      // const element = document.querySelector('#certificate')!;
      // html2canvas(this.certificateContent.nativeElement, {
      //promise.push(await this.createCertificatePDF(cert,index));
      index++;
      await this.createCertificatePDF(cert, index);
    });
    //     const zipBlob = await zip.generateAsync({ type: 'blob' });
    // saveAs(zipBlob, 'Certificates.zip');

    //     Promise.all(promise).finally(()=>{
    //     this.certificateZip.generateAsync({type:"blob"}).then(function(content) {
    //   console.log("after zip generate");
    //   saveAs(content, "Certificates.zip");
    // })

    //   });
    //    await this.certificateZip.generateAsync({type:"blob"}).then(function(content) {
    //   console.log("after zip generate");
    //   saveAs(content, "Certificates.zip");
    // })
  }

  createCertificatePDF(cert: any, index: number): Promise<unknown> {
    return new Promise(async (resolve) => {
      await html2canvas(document.querySelector('#certificate')!, {
        useCORS: true, // allow cross-origin images
        allowTaint: false, // don't allow tainted canvas
        scale: 2, // better quality
      }).then((canvas) => {
        // const canvas = await html2canvas(element as HTMLElement, {
        //   useCORS: true, // allow cross-origin images
        //   allowTaint: false, // don't allow tainted canvas
        //   scale: 2, // better quality
        // });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        //pdf.save(`Certificate-${cert?.name || 'Trainee'}.pdf`);
        const pdfBlob = pdf.output('blob');
        this.certificateZip.file(
          `Certificate-${
            cert?.name + '_' + cert?.uin || 'Trainee'
          }.pdf`,
          pdfBlob
        );
        //index++;
      });
      resolve('');
      await this.delay(1000);
    }).finally(() => {
      if (index === this.bulkCertificateDownload.length) {
        this.certificateZip
          .generateAsync({ type: 'blob' })
          .then(function (content) {
            console.log('after zip generate');
            saveAs(content, 'Certificates.zip');
          });
        const targetDiv = document.getElementById('certificate')!;
        targetDiv.innerHTML = ``;
      }
    });
  }
  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  filters = {
    trainingTitle: null,
    scheme: null,
    trainingInstituteName: null,
    trainerName: null,
    location: null,
    trainingDate: null,
    status: null,
    district: null,
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
      console.log(ele.trainingTitle);
    });
  }
  uniqueValuesTrainingTitle(): any[] {
    return [
      ...new Set(this.trainingsList.map((item) => item['trainingTitle'])),
    ];
  }

  uniqueValuesDistrict(): any[] {
    return [
      ...new Set(this.trainingsList.map((item) => item['venueDistrict'])),
    ];
  }

  uniqueValuesTrainingDate(): any[] {
    return [...new Set(this.trainingsList.map((item) => item['trainingDate']))];
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
            trainee.status = 'VALIDATED_BY_INSTITUTE_HEAD';
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
                this.selectedTraineeForReject.status = 'REJECTED_BY_INSTITUTE_HEAD';
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
  }

  downloadCertificate(trainee: any): void {
    console.log('Downloading certificate for trainee:', trainee);
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
            this.certificateData.location = response.data.venueBlock?response.data.venueBlock:''+
            response.data.venueBlock && response.data.venueDistrict?', ':''+
            response.data.venueDistrict?response.data.venueDistrict:''+response.data.venueDistrict&& response.data.venueState?', ':''
            + response.data.venueState? response.data.venueState:'';
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
      this.selectedTraineesForBulkReject = items;
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
              trainee.status = 'VALIDATED_BY_INSTITUTE_HEAD';
            } else {
              trainee.status = 'APPROVED';
            }
          });
          
          this.toastr.success(
            `${eligibleTrainees.length} trainees approved successfully!`
          );
          
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
    this.rejectModalRef = this.modalService.open(this.rejectModal, { centered: true });
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
        if (response.success) {
          // Update status for all rejected trainees based on user role
        eligibleTrainees.forEach((trainee) => {
          if (this.userRole === 3) {
            trainee.status = 'REJECTED_BY_INSTITUTE_HEAD';
          } else {
            trainee.status = 'REJECTED';
          }
          trainee.remarks = remarks;
        });
          this.toastr.success(
            `${eligibleTrainees.length} trainee(s) rejected successfully`,
            'Success'
          );
          // Refresh the trainee list
          this.refreshTraineeList();
        } else {
          this.toastr.error(
            response.message || 'Failed to reject trainees',
            'Error'
          );
        }
        this.isTableLoading = false;
        if (this.rejectModalRef) {
          this.rejectModalRef.close();
          this.rejectModalRef = null;
        }
        this.selectedTraineesForBulkReject = [];
      },
      error: (error) => {
        const errorMessage =
          error.error?.message || 'An error occurred while rejecting trainees';
        this.isTableLoading = false;
        this.toastr.error(errorMessage, 'Error');
        console.error('Error rejecting trainees:', error);
        if (this.rejectModalRef) {
          this.rejectModalRef.close();
          this.rejectModalRef = null;
        }
        this.selectedTraineesForBulkReject = [];
      },
    });
  }
}
