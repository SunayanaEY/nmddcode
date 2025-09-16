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

@Component({
  selector: 'app-training-type-management',
  imports: [TableComponent, BreadcrumbComponent],
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
  addNew: String = 'Add new training type';

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
    { label: 'Dashboard', url: '/admin/training-module' },
    { label: 'Training Type Management' },
  ];
  tableColumns: TableColumn[] = [{ key: 'title', header: 'Training Type' }];

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
    this.trainingTypeService.getAllTrainingTypes().subscribe({
      next: (res) => {
        this.trainingTypeList = res;
        let index = 0;
        this.trainingTypeList.forEach((ele) => {
          let data = {
            id: ele['id'],
            title: ele['trainingTypeName'],
            editable: false,
            actions: [...this.tableActions],
          };
          this.trainingTypeListProcessed.push(data);
        });
      },
      error: (error) => {
        this.toastr.error('Error while fetching training types!');
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
      console.log('trainingTypeListProcessed changed');
    } else if (this.event.action == 'save') {
      if (event.item.title == null || event.item.title == '') {
        this.toastr.warning('Please enter training type!');
      } else {
        this.confirmationMessage = 'Confirm to Save the changes!';
        this.confirmChangeModal();
      }
    } else if (this.event.action == 'delete') {
      if (event.item.title == null || event.item.title == '') {
        this.trainingTypeListProcessed.splice(this.event.index, 1);
      } else {
        this.confirmationMessage =
          'Confirm to delete training type - ' + event.item.title;
        this.confirmChangeModal();
      }
    } else if (this.event.action == 'add') {
      this.trainingTypeListProcessed.push({
        id: null,
        title: '',
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
    if (this.event.action == 'save') {
      this.trainingTypeListProcessed[this.event.index].editable = false;
      let data = {
        id: this.event.item.id,
        trainingTypeName: this.event.item.title,
      };
      this.trainingTypeService.saveTrainingType(data).subscribe({
        next: (res: any) => {
          this.toastr.success('Saved Training Type successfully!');
          this.ngOnInit();
        },
        error: (error) => {
          this.toastr.error('Error while saving Training Type!');
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
          },
        });
    }
    this.modalService.dismissAll();
  }
}
