import { Component, ElementRef, ViewChild } from '@angular/core';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { TableAction, TableColumn, TableComponent } from '../../../components/table/table.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-all-trainings',
  imports: [CommonModule, BreadcrumbComponent, TableComponent,NgSelectModule,
    ReactiveFormsModule,FormsModule
  ],
  templateUrl: './all-trainings.component.html',
  styleUrl: './all-trainings.component.css'
})
export class AllTrainingsComponent {
  private bootstrap: any;
  @ViewChild('trainingDetailsModal')
  trainingDetailsModal!: ElementRef;
  submitted:Boolean = false;
   trainingForm!: FormGroup;
  isExportCSV:Boolean =true;
  isExportPdf:Boolean =true;
  isBulkCertDownload:Boolean =true;
  fileName:String = 'All_trainings_'
  fileNameTrainees:String = 'All_trainee_List_'
  pdfHeaders: Array<string> = [
    'Training Title', 'Date', 'Scheme','Location','Submission Date','Status'
  ];
  columnKeys:Array<string> =['trainingTitle','date','scheme','location','submittedOn','status']
  breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Training Module', url: '/dashboard/training-module' },
      { label: 'All Registered Trainings' }
    ];
    tableColumns: TableColumn[] = [
        { key: 'trainingTitle', header: 'Training Title' },
        { key: 'date', header: 'Date' },
        { key: 'scheme', header: 'Scheme' },
        { key: 'location', header: 'Location' },
        { key: 'submittedOn', header: 'Submitted On' },
        { key: 'status', header: 'Status' },
      ];

      tableActions: TableAction[] = [
        { name: 'view', icon: 'bi bi-eye', class: 'btn-info', title: 'View' },
        // { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download' },
      ];

      tableData: any[] = [
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'XYZ ', date: '05-May-2025', scheme: 'PMKVYll', location: 'Kanpur,Uttar Pradesh,INdia', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
        { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
      ];


      // TRainee dummy data
      pdfHeadersTrainee: Array<string> = [
    'Name', 'Age', 'Gender','Aadhaar','Email','Date'
  ];
  columnKeysTrainee:Array<string> =['traineeName','age','gender','aadhaar','email','date']

    tableColumnsTrainee: TableColumn[] = [
        { key: 'traineeName', header: 'Name' },
        { key: 'age', header: 'Age' },
        { key: 'gender', header: 'Gender' },
        { key: 'aadhaar', header: 'Aadhaar' },
        { key: 'email', header: 'Email' },
        { key: 'date', header: 'Date' },
      ];

      tableActionsTrainee: TableAction[] = [
        //{ name: 'download', icon: 'bi bi-eye', class: 'btn-info', title: 'Download certificate' },
        { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download certificate' },
      ];

      tableDataTrainee: any[] = [
        { traineeName: 'Manoj Kumar', age: 30, gender: 'M', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Suman Devi', age: 44, gender: 'F', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Manoj Kumar', age: 30, gender: 'M', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Manoj Kumar', age: 30, gender: 'M', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Suman Devi', age: 44, gender: 'F', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Manoj Kumar', age: 30, gender: 'M', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Manoj Kumar', age: 30, gender: 'M', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Suman Devi', age: 44, gender: 'F', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Manoj Kumar', age: 30, gender: 'M', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Suman Devi', age: 44, gender: 'F', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
        { traineeName: 'Manoj Kumar', age: 30, gender: 'M', aadhaar: 'XXXXXXXXXX25', email: 'XXXXXX5@gmail.com', date: '03-05-2025' },
      ];


      constructor(private formBuilder: FormBuilder,
        private modalService: NgbModal,
      ){

      }

      ngOnInit(): void {
        this.trainingForm = this.formBuilder.group({
        id: [''],
        comment: ['', [Validators.required]],
        status: ['', [Validators.required]]
      });
      }

      filteredData = [...this.tableData];
      handleTableAction(event: { action: string, item: any, index: number }): void {
        console.log('Action:', event.action, 'Item:', event.item);
        // const modal = new this.bootstrap.Modal(this.trainingDetailsModal.nativeElement);
      //modal.show();
        this.modalService.open(this.trainingDetailsModal, {
        size: 'xl',
        scrollable: true,
        backdrop: 'static',
        keyboard: false
      });
      }

      filters = { trainingTitle:null,date: null, scheme: null, location: null ,submittedOn:null,
    status:null
  };

  applyFilters(): void {
      this.filteredData = this.tableData.filter(row => {
        return (
          (!this.filters.trainingTitle || row.trainingTitle === this.filters.trainingTitle) &&
          (!this.filters.date || row.date === this.filters.date) &&
          (!this.filters.scheme || row.scheme === this.filters.scheme) &&
          (!this.filters.location || row.location === this.filters.location) &&
          (!this.filters.submittedOn || row.submittedOn === this.filters.submittedOn) &&
          (!this.filters.status || row.status === this.filters.status)

          // (!this.filters.sync_status || row.sync_status.toString() === this.filters.sync_status.toString()) &&

        );
      });

      this.filteredData.forEach(ele => {
        console.log(ele.trainingTitle);
      })
    }
     uniqueValuesTrainingTitle(): any[] {

    return [...new Set(this.tableData.map(item => item['trainingTitle']))];

  }

  uniqueValuesDate(): any[] {

    return [...new Set(this.tableData.map(item => item['date']))];

  }

  uniqueValuesScheme(): any[] {

    return [...new Set(this.tableData.map(item => item['scheme']))];

  }

  uniqueValuesocation(): any[] {

    return [...new Set(this.tableData.map(item => item['location']))];

  }

  uniqueValuesSubmittedON(): any[] {

    return [...new Set(this.tableData.map(item => item['submittedOn']))];

  }

  uniqueValuesStatus(): any[] {

    return [...new Set(this.tableData.map(item => item['status']))];

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
}
