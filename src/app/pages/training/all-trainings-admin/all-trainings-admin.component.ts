import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableColumn, TableAction, TableComponent } from '../../../components/table/table.component';
import { TrainingsList, TraineeDetails } from '../models/training.model';
import { TrainingService } from '../services/training.service';
import { AdminService } from '../services/training-admin.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { ToastrService } from 'ngx-toastr';
import { CertificateLayoutComponent } from '../../certificate-layout/certificate-layout.component';

@Component({
  selector: 'app-all-trainings-admin',
  imports: [CommonModule, BreadcrumbComponent, TableComponent,NgSelectModule,
    ReactiveFormsModule,FormsModule, CertificateLayoutComponent],
  templateUrl: './all-trainings-admin.component.html',
  styleUrl: './all-trainings-admin.component.css'
})
export class AllTrainingsAdminComponent {


    trainingDetails:any;
  @ViewChild('trainingDetailsModal')
  trainingDetailsModal!: ElementRef;
  @ViewChild('rejectModal')
  rejectModal!: ElementRef;
  @ViewChild('certificateModal')
  certificateModal!: ElementRef;
  submitted:Boolean = false;
  certificateData: any = null;
  selectedTraineeForCertificate: any = null;
   trainingForm!: FormGroup;
   rejectForm!: FormGroup;
   selectedTraineeForReject: any = null;
   currentTrainingInstituteId: string = '';
   currentTrainingId: number = 0;
  isExportCSV:Boolean =true;
  isExportPdf:Boolean =true;
  isBulkCertDownload:Boolean =true;
  fileName:String = 'All_trainings_';
  fileNameTrainees:String = 'All_trainee_List_';
  traineesFile:String = 'All_trainee_List_';
  pdfHeaders: Array<string> = [
    'Sr.No.','Training Title', 'Scheme', 'Training Institute','Trainer Name','Location','Training Date','Status'
  ];
  columnKeys:Array<string> =['trainingTitle','scheme','trainingInstituteName','trainerName','location','trainingDate','status']
  breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Training Module', url: '/admin/training-module' },
      { label: 'Approve/Reject Trainings' }
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

      trainingsList: TrainingsList[]=[];
      traineeList:TraineeDetails[]=[];


      pdfHeadersTrainee: Array<string> = ['Sr.No.',
    'Name', 'Age', 'Gender','Contact','Email','Status'
  ];
  columnKeysTrainee:Array<string> =['name','age','gender','contactNumber','email','status']

    tableColumnsTrainee: TableColumn[] = [
        { key: 'name', header: 'Name' },
        { key: 'age', header: 'Age' },
        { key: 'gender', header: 'Gender' },
        { key: 'contactNumber', header: 'Contact' },
        { key: 'email', header: 'Email' },
        { key: 'status', header: 'Status' },
      ];

      tableActionsTrainee: TableAction[] = [
        { name: 'approve', icon: 'bi bi-check-circle', class: 'btn-success', title: 'Approve',
          condition: (row: any) => row.status !== 'APPROVED',
        },
        { name: 'reject', icon: 'bi bi-x-circle', class: 'btn-danger', title: 'Reject',
          condition: (row: any) => row.status !== 'REJECTED' && row.status !== 'APPROVED',
        },
        { name: 'download', icon: 'bi bi-download', class: 'btn-info', title: 'Download certificate',
          condition: (row: any) => row.status === 'APPROVED',
        },
      ];



      constructor(private formBuilder: FormBuilder,
        private modalService: NgbModal, private trainingsService: TrainingService,
        private adminService: AdminService, private toastr: ToastrService
      ){

      }
      filteredData = [...this.trainingsList];

      ngOnInit(): void {
        this.trainingForm = this.formBuilder.group({
        id: [''],
        comment: ['', [Validators.required]],
        status: ['', [Validators.required]]
      });
      
      this.rejectForm = this.formBuilder.group({
        remarks: ['', [Validators.required]]
      });
      this.trainingsService.getAllTraining().subscribe(res => {
        this.trainingsList = res.data;
        this.filteredData = [...this.trainingsList];
        let index=0;
        this.trainingsList.forEach(ele => {
          const datePipe = new DatePipe('en-US');
          ele['location'] = ele['venueBlock']+","+
          ele['venueDistrict']+","+ele["venueState"];
          ele['trainingDate']= datePipe.transform(ele['trainingDate'], 'dd/MM/yyyy')!;
          this.trainingsList[index]=ele;
          index++;
        })
      });

      }


      handleTableAction(event: { action: string, item: any, index: number }): void {
        console.log('Action:', event.action, 'Item:', event.item);
        
        if (event.action === 'view') {
          this.traineeList=[];
          this.trainingDetails = event.item;
          // Set current training details for API calls
          this.currentTrainingId = this.trainingDetails.id;
          this.currentTrainingInstituteId = this.trainingDetails.trainingInstituteId || this.trainingDetails.instituteId || '';
          
          this.fileNameTrainees = this.traineesFile;
          this.fileNameTrainees = this.fileNameTrainees+this.trainingDetails.trainingInstituteName+"_"+
            this.trainingDetails.trainingTitle+"_";
          this.trainingsService.getTraineeList(this.trainingDetails.id).subscribe(
            res=>{
              this.traineeList = res.data;
            }
          );

          this.modalService.open(this.trainingDetailsModal, {
            size: 'xl',
            scrollable: true,
            backdrop: 'static',
            keyboard: false
          });
        } else if (event.action === 'approve') {
          this.approveTrainee(event.item);
        } else if (event.action === 'reject') {
          this.selectedTraineeForReject = event.item;
          this.rejectForm.reset();
          this.modalService.open(this.rejectModal, {
            size: 'md',
            backdrop: 'static',
            keyboard: false
          });
        } else if (event.action === 'download') {
          this.downloadCertificate(event.item);
        }
      }


      filters = { trainingTitle:null,scheme: null, trainingInstituteName: null, trainerName: null ,location:null,
    trainingDate:null,status:null, district:null
  };

  applyFilters(): void {

      this.filteredData = this.trainingsList.filter(row => {
        return (
          (!this.filters.trainingTitle || row.trainingTitle === this.filters.trainingTitle) &&
          (!this.filters.scheme || row.scheme === this.filters.scheme) &&
          (!this.filters.trainingInstituteName || row.trainingInstituteName === this.filters.trainingInstituteName) &&
          (!this.filters.trainerName || row.trainerName === this.filters.trainerName) &&
          (!this.filters.location || row.location === this.filters.location) &&
          (!this.filters.district || row.venueDistrict === this.filters.district) &&
          (!this.filters.trainingDate || row.trainingDate === this.filters.trainingDate)&&
          (!this.filters.status || row.status === this.filters.status)

          // (!this.filters.sync_status || row.sync_status.toString() === this.filters.sync_status.toString()) &&

        );
      });

      this.filteredData.forEach(ele => {
        console.log(ele.trainingTitle);
      })
    }
     uniqueValuesTrainingTitle(): any[] {

    return [...new Set(this.trainingsList.map(item => item['trainingTitle']))];

  }

  uniqueValuesDistrict():any[]{
    return [...new Set(this.trainingsList.map(item => item['venueDistrict']))];
  }

  uniqueValuesTrainingDate(): any[] {

    return [...new Set(this.trainingsList.map(item => item['trainingDate']))];

  }

  uniqueValuesScheme(): any[] {

    return [...new Set(this.trainingsList.map(item => item['scheme']))];

  }


  uniqueValuesInstituteName(): any[] {

    return [...new Set(this.trainingsList.map(item => item['trainingInstituteName']))];

  }
  uniqueValuesTrainerName(): any[] {

    return [...new Set(this.trainingsList.map(item => item['trainerName']))];

  }
  uniqueValueslocation(): any[] {

    return [...new Set(this.trainingsList.map(item => item['location']))];

  }



  uniqueValuesStatus(): any[] {

    return [...new Set(this.trainingsList.map(item => item['status']))];

  }

  reset(){

  }

  open(){

  }
   get formControls() {
    return this.trainingForm.controls;
  }

  keyFunc(){

  }

  approveTrainee(trainee: any): void {
    debugger;
    const payload = {
      trainingInstituteId: this.currentTrainingInstituteId,
      trainingId: this.currentTrainingId,
      traineeIds: [trainee.id]
    };

    this.adminService.approveTrainees(payload).subscribe({
       next: (response) => {
         if (response.success) {
           trainee.status = 'APPROVED';
           this.toastr.success(response.data.message || 'Trainee approved successfully', 'Success');
         } else {
           this.toastr.error(response.message || 'Failed to approve trainee', 'Error');
         }
       },
       error: (error) => {
         const errorMessage = error.error?.message || 'An error occurred while approving trainee';
         this.toastr.error(errorMessage, 'Error');
         console.error('Error approving trainee:', error);
       }
     });
  }

  rejectTrainee(): void {
    if (this.rejectForm.valid && this.selectedTraineeForReject) {
      const remarks = this.rejectForm.get('remarks')?.value;
      const payload = {
        trainingInstituteId: this.currentTrainingInstituteId,
        trainingId: this.currentTrainingId,
        traineeIds: [this.selectedTraineeForReject.id],
        rejectionRemarks: remarks
      };

      this.adminService.rejectTrainees(payload).subscribe({
         next: (response) => {
           if (response.success) {
             this.selectedTraineeForReject.status = 'REJECTED';
             this.selectedTraineeForReject.remarks = remarks;
             this.toastr.success(response.data.message || 'Trainee rejected successfully', 'Success');
           } else {
             this.toastr.error(response.message || 'Failed to reject trainee', 'Error');
           }
           this.modalService.dismissAll();
           this.selectedTraineeForReject = null;
         },
         error: (error) => {
           const errorMessage = error.error?.message || 'An error occurred while rejecting trainee';
           this.toastr.error(errorMessage, 'Error');
           console.error('Error rejecting trainee:', error);
           this.modalService.dismissAll();
           this.selectedTraineeForReject = null;
         }
       });
    }
  }

  downloadCertificate(trainee: any): void {
    console.log('Downloading certificate for trainee:', trainee);
    this.selectedTraineeForCertificate = trainee;
    
    // Call the getCertificateDetails API
    this.trainingsService.getCertificateDetails(
      trainee.uin || '',
      trainee.email || '',
      trainee.contactNumber || ''
    ).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.certificateData = response.data;
          // Open certificate modal
          this.modalService.open(this.certificateModal, {
            size: 'xl',
            scrollable: true,
            backdrop: 'static',
            keyboard: false
          });
        } else {
          this.toastr.error(response.message || 'Failed to load certificate details', 'Error');
        }
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'An error occurred while loading certificate details';
        this.toastr.error(errorMessage, 'Error');
        console.error('Error loading certificate details:', error);
      }
    });
  }

  // Check if all trainees are approved to show bulk download button
  get allTraineesApproved(): boolean {
    return this.traineeList.length > 0 && this.traineeList.every(trainee => trainee.status === 'APPROVED');
  }

  get rejectFormControls() {
    return this.rejectForm.controls;
  }

}
