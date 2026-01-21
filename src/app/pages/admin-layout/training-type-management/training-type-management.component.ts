import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import {
  TableColumn,
  TableAction,
  TableComponent,
} from '../../../components/table/table.component';
import { TrainingTypeService } from '../../training/services/training-type.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-training-type-management',
  imports: [TableComponent, BreadcrumbComponent,TranslateModule],
  templateUrl: './training-type-management.component.html',
  styleUrl: './training-type-management.component.css',
})
export class TrainingTypeManagementComponent {
  confirmationMessage: string = '';
  event: any;
  @ViewChild('trainingTypeConfirmationModal')
  trainingTypeConfirmationModal!: ElementRef;
  isExportCSV: Boolean = false;
  isExportPdf: Boolean = false;
  table: string = 'trainingTypes';
  addNew: string = 'Add new training type';
  isLoading: boolean = false;

  fileName: String = 'All_trainings_';

  pdfHeaders: Array<string> = [
    'Training Title',
    'Date',
    'Scheme',
    'Location',
    'Submission Date',
    'Status',
  ];
  columnKeys: Array<string> = [
    'trainingTitle',
    'date',
    'scheme',
    'location',
    'submittedOn',
    'status',
  ];
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Type Management' },
  ];
  tableColumns: TableColumn[] = [
    { key: 'title', header: 'Training Type' },
    { key: 'typeRefCode', header: 'Training type code' },
  ];

  tableActions: TableAction[] = [
    {
      name: 'edit',
      icon: 'bi bi-pencil-fill',
      class: 'btn-info',
      title: 'Edit',
    },
    { name: 'delete', icon: 'bi bi-trash', class: 'btn-info', title: 'Delete' },
  ];

  trainingTypeList: any[] = [];
  trainingTypeListProcessed: any[] = [];
  changeTableActions() {}

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private trainingTypeService: TrainingTypeService
  ) {}

  ngOnInit() {
    this.trainingTypeListProcessed = [];
    this.isLoading = true;
    this.trainingTypeService.getAllTrainingTypes().subscribe({
      next: (res) => {
        this.trainingTypeList = res;
        let index = 0;
        this.trainingTypeList.forEach((ele) => {
          let data = {
            id: ele['id'],
            title: ele['trainingTypeName'],
            typeRefCode: ele['typeRefCode'] || '',
            editable: false,
            actions: [...this.tableActions],
          };
          this.trainingTypeListProcessed.push(data);
        });
        // Temporary delay for testing loader visibility
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      },
      error: (error) => {
        this.toastr.error('Error while fetching training types!');
        this.isLoading = false;
      },
    });
  }
  handleTableAction(event: { action: string; item: any; index: number }): void {
    this.event = event;
    if (this.event.action == 'edit') {
      this.trainingTypeListProcessed[this.event.index].editable = true;

      this.trainingTypeListProcessed[this.event.index].actions = [
        {
          name: 'save',
          icon: 'bi bi-save-fill',
          class: 'btn-info',
          title: 'Save',
        },
        {
          name: 'delete',
          icon: 'bi bi-trash',
          class: 'btn-info',
          title: 'Delete',
        },
      ];
    } else if (this.event.action == 'save') {
      if (!event.item.title || event.item.title === '') {
        this.toastr.warning('Please enter training type!');
      } else if (!event.item.typeRefCode || event.item.typeRefCode === '') {
        this.toastr.warning('Please enter training type code!');
      } else if (
        !/^[A-Za-z]{3}$/.test(String(event.item.typeRefCode || '').trim())
      ) {
        this.toastr.warning(
          'Training type code must be exactly 3 alphabetic characters!'
        );
      } else {
        this.confirmationMessage = 'Confirm to Save the changes!';
        this.confirmChangeModal();
      }
    } else if (this.event.action == 'delete') {
      if (!event.item.id) {
        this.trainingTypeListProcessed.splice(this.event.index, 1);
      } else if (event.item.title == null || event.item.title == '') {
        this.trainingTypeListProcessed.splice(this.event.index, 1);
      } else {
        if (localStorage.getItem('language') == 'hi')
          this.confirmationMessage =
            'योजना को हटाने की पुष्टि करें - ' + event.item.title;
        else
          this.confirmationMessage =
            'Confirm to delete training type - ' + event.item.title;
        this.confirmChangeModal();
      }
    } else if (this.event.action == 'add') {
      this.trainingTypeListProcessed.unshift({
        id: null,
        title: '',
        typeRefCode: '',
        editable: true,
        actions: [
          {
            name: 'save',
            icon: 'bi bi-save-fill',
            class: 'btn-info',
            title: 'Save',
          },
          {
            name: 'delete',
            icon: 'bi bi-trash',
            class: 'btn-info',
            title: 'Delete',
          },
        ],
      });
    }
  }

  confirmChangeModal() {
    this.modalService.open(this.trainingTypeConfirmationModal, {
      size: 'sm',
      scrollable: false,
      backdrop: 'static',
      keyboard: false,
    });
  }

  confirm() {
    this.isLoading = true;
    if (this.event.action == 'save') {
      this.trainingTypeListProcessed[this.event.index].editable = false;
      let data = {
        id: this.event.item.id,
        trainingTypeName: this.event.item.title,
        typeRefCode: this.event.item.typeRefCode,
      };
      this.trainingTypeService.saveTrainingType(data).subscribe({
        next: (res: any) => {
          this.toastr.success('Saved Training Type successfully!');
          this.ngOnInit();
        },
        error: (error) => {
          this.toastr.error('Error while saving Training Type!');
          this.isLoading = false;
        },
      });
    } else if (this.event.action == 'delete') {
      this.trainingTypeService
        .deleteTrainingType(this.event.item.id)
        .subscribe({
          next: (res) => {
            this.toastr.success('Training Type deleted successfully!');
            this.ngOnInit();
          },
          error: (error) => {
            this.toastr.error('Error while deleting Training Type!');
            this.isLoading = false;
          },
        });
    }
    this.modalService.dismissAll();
  }
}
