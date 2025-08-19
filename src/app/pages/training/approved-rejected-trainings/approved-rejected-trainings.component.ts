import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableColumn, TableAction, TableComponent } from '../../../components/table/table.component';
import { TrainingsList, TraineeDetails } from '../models/training.model';
import { TrainingService } from '../services/training.service';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-approved-rejected-trainings',
  imports: [CommonModule, BreadcrumbComponent, TableComponent,NgSelectModule,
    ReactiveFormsModule,FormsModule],
  templateUrl: './approved-rejected-trainings.component.html',
  styleUrl: './approved-rejected-trainings.component.css'
})
export class ApprovedRejectedTrainingsComponent {

  trainingDetails:any;
  @ViewChild('trainingDetailsModal')
  trainingDetailsModal!: ElementRef;
  submitted:Boolean = false;
   trainingForm!: FormGroup;
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
      { label: 'Approved/Rejected Trainings' }
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
    'Name', 'Age', 'Gender','Contact','Email'
  ];
  columnKeysTrainee:Array<string> =['name','age','gender','contactNumber','email']

    tableColumnsTrainee: TableColumn[] = [
        { key: 'name', header: 'Name' },
        { key: 'age', header: 'Age' },
        { key: 'gender', header: 'Gender' },
        { key: 'contactNumber', header: 'Contact' },
        { key: 'email', header: 'Email' },
      ];

      tableActionsTrainee: TableAction[] = [
        //{ name: 'download', icon: 'bi bi-eye', class: 'btn-info', title: 'Download certificate' },
        { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download certificate' },
      ];



      constructor(private formBuilder: FormBuilder,
        private modalService: NgbModal, private trainingsService: TrainingService
      ){

      }
      filteredData = [...this.trainingsList];

      ngOnInit(): void {
        this.trainingForm = this.formBuilder.group({
        id: [''],
        comment: ['', [Validators.required]],
        status: ['', [Validators.required]]
      });
      this.trainingsService.getAllTrainings().subscribe(res => {
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
        // const modal = new this.bootstrap.Modal(this.trainingDetailsModal.nativeElement);
      //modal.show();
      this.traineeList=[];
      this.trainingDetails = event.item;
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
      }


      filters = { trainingTitle:null,scheme: null, trainingInstituteName: null, trainerName: null ,location:null,
    trainingDate:null,status:null
  };

  applyFilters(): void {

      this.filteredData = this.trainingsList.filter(row => {
        return (
          (!this.filters.trainingTitle || row.trainingTitle === this.filters.trainingTitle) &&
          (!this.filters.scheme || row.scheme === this.filters.scheme) &&
          (!this.filters.trainingInstituteName || row.trainingInstituteName === this.filters.trainingInstituteName) &&
          (!this.filters.trainerName || row.trainerName === this.filters.trainerName) &&
          (!this.filters.location || row.location === this.filters.location) &&
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

  modalDismiss(){
    this.modalService.dismissAll();
    this.ngOnInit();
  }
}
