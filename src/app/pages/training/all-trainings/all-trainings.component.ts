import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { TraineeDetails, TrainingsList } from '../models/training.model';
import { TranslateModule } from '@ngx-translate/core';

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
  ],
  templateUrl: './all-trainings.component.html',
  styleUrl: './all-trainings.component.css',
})
export class AllTrainingsComponent {
  private bootstrap: any;
  trainingDetails: any;
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
  ];

  trainingsList: TrainingsList[] = [];
  traineeList: TraineeDetails[] = [];
  userData: any = sessionStorage.getItem('user');
  trainingInstituteId: any;

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
    private router: Router
  ) {}
  filteredData = [...this.trainingsList];

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
    }
    this.trainingsService
      .getAllTrainings(this.trainingInstituteId)
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
      });
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
    if (event.action == 'edit') {
      // alert(JSON.stringify(event.item));
      this.router.navigate(['/admin/training-certificate-generation'], {
        queryParams: { trainingId: event.item.id, populate: true },
      });
    } else {
      this.traineeList = [];
      this.trainingDetails = event.item;
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
        (!this.filters.endDate ||
          row.endDate === this.filters.endDate)

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

  // uniqueValuesStatus(): any[] {
  //   return [...new Set(this.trainingsList.map((item) => item['status']))];
  // }

  reset() {}

  open() {}
  get formControls() {
    return this.trainingForm.controls;
  }

  keyFunc() {}
}
