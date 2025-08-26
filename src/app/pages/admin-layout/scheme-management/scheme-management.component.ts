import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import {
  TableColumn,
  TableAction,
  TableComponent,
} from '../../../components/table/table.component';
import { index } from 'd3';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { SchemeService } from '../../training/services/scheme.service';
import { error } from 'console';

@Component({
  selector: 'app-scheme-management',
  imports: [TableComponent, BreadcrumbComponent],
  templateUrl: './scheme-management.component.html',
  styleUrl: './scheme-management.component.css',
})
export class SchemeManagementComponent {
  confirmationMessage: string = '';
  event: any;
  @ViewChild('schemeConfirmationModal')
  schemeConfirmationModal!: ElementRef;
  isExportCSV: Boolean = false;
  isExportPdf: Boolean = false;
  table: string = 'schemes';
  addNew: String = 'Add new Scheme';
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
    { label: 'Central Admin Login', url: '/dashboard' },
    { label: 'Scheme Management' },
  ];
  tableColumns: TableColumn[] = [{ key: 'title', header: 'Scheme' }];

  tableActions: TableAction[] = [
    {
      name: 'edit',
      icon: 'bi bi-pencil-fill',
      class: 'btn-info',
      title: 'Edit',
    },
    { name: 'delete', icon: 'bi bi-trash', class: 'btn-info', title: 'Delete' },
  ];

  changeTableActions() {}
  schemeList: any[] = [];
  schemeListProcessed: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private schemeService: SchemeService
  ) {}

  ngOnInit() {
    this.schemeListProcessed = [];
    this.schemeService.getAllSchemes().subscribe({
      next: (res) => {
        this.schemeList = res;
        let index = 0;
        this.schemeList.forEach((ele) => {
          let data = {
            id: ele['id'],
            title: ele['schemeName'],
            editable: false,
            actions: [...this.tableActions],
          };

          this.schemeListProcessed.push(data);
        });
      },
      error: (error) => {
        this.toastr.error('Error while fetching schemes!');
      },
    });
  }
  handleTableAction(event: { action: string; item: any; index: number }): void {
    this.event = event;
    if (this.event.action == 'edit') {
      this.schemeListProcessed[this.event.index].editable = true;

      this.schemeListProcessed[this.event.index].actions = [
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
      if (event.item.title == null || event.item.title == '') {
        this.toastr.warning('Please enter scheme name!');
      } else {
        this.confirmationMessage = 'Confirm to Save the changes!';
        this.confirmChangeModal();
      }
    } else if (this.event.action == 'delete') {
      if (event.item.title == null || event.item.title == '') {
        this.schemeListProcessed.splice(this.event.index, 1);
      } else {
        this.confirmationMessage =
          'Confirm to delete the scheme - ' + event.item.title;
        this.confirmChangeModal();
      }
    } else if (this.event.action == 'add') {
      this.schemeListProcessed.push({
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
    this.modalService.open(this.schemeConfirmationModal, {
      size: 'sm',
      scrollable: false,
      backdrop: 'static',
      keyboard: false,
    });
  }

  confirm() {
    if (this.event.action == 'save') {
      this.schemeListProcessed[this.event.index].editable = false;
      let data = {
        id: this.event.item.id,
        schemeName: this.event.item.title,
      };
      this.schemeService.saveScheme(data).subscribe({
        next: (res: any) => {
          this.toastr.success('Saved Scheme successfully!');
          this.ngOnInit();
        },
        error: (error) => {
          this.toastr.error('Error while saving scheme!');
        },
      });
    } else if (this.event.action == 'delete') {
      this.schemeService.deleteScheme(this.event.item.id).subscribe({
        next: (res) => {
          this.toastr.success('Scheme deleted successfully!');
          this.ngOnInit();
        },
        error: (error) => {
          this.toastr.error('Error while deleting scheme!');
        },
      });
    }
    this.modalService.dismissAll();
  }
}
