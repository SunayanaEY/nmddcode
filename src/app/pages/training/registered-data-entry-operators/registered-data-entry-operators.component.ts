import { CommonModule } from '@angular/common';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../../components/table/table.component';
import { DataEntryOperatorService } from '../services/data-entry-operator.service';
import { DataEntryOperator } from '../models/data-entry-operator.model';
import { TranslateModule } from '@ngx-translate/core';
import { UserProfileService } from '../../user-profile-creation/services/user-profile.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registered-data-entry-operators',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, TableComponent, TranslateModule],
  templateUrl: './registered-data-entry-operators.component.html',
  styleUrl: './registered-data-entry-operators.component.css',
})
export class RegisteredDataEntryOperatorsComponent implements OnInit {
  @Output() editRequested = new EventEmitter<any>();

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Registered Training Managers' },
  ];

  tableColumns: TableColumn[] = [
    { key: 'operatorName', header: 'TABLE_COLUMNS.OPERATOR_NAME' },
    { key: 'designation', header: 'TABLE_COLUMNS.DESIGNATION' },
    { key: 'contactNumber', header: 'TABLE_COLUMNS.CONTACT_NUMBER' },
    { key: 'emailId', header: 'TABLE_COLUMNS.EMAIL_ID' },
    { key: 'createdBy', header: 'TABLE_COLUMNS.CREATED_BY' },
    {
      key: 'createdAt',
      header: 'TABLE_COLUMNS.CREATION_DATE',
      transform: (value: string) => {
        return new Date(value).toLocaleDateString('en-IN');
      },
    },
    {
      key: 'active',
      header: 'STATUS',
      transform: (value: boolean) => {
        return value ? 'ACTIVE' : 'INACTIVE';
      },
    },
  ];

  tableActions: TableAction[] = [
    { name: 'edit', icon: 'bi bi-pencil', class: 'btn-info', title: 'Edit' },
    {
      name: 'delete',
      icon: 'bi bi-trash',
      class: 'btn-danger',
      title: 'Delete',
    },
  ];

  tableData: DataEntryOperator[] = [];
  isLoading = false;
  trainingHeadId: string = '';

  constructor(
    private dataEntryOperatorService: DataEntryOperatorService,
    private router: Router,
    private userProfileService: UserProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getTrainingHeadId();
    this.loadDataEntryOperators();
  }

  private getTrainingHeadId(): void {
    try {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.trainingHeadId = user.trainingHeadId;
      }
    } catch (error) {
      console.error('Error parsing user data from session storage:', error);
    }
  }
  // handleTableAction(event: { action: string; item: any; index: number }): void {
  //   alert(event);
  //   if (event.action === 'edit') {
  //
  //   } else if (event.action === 'delete') {
  //   }
  // }

  loadDataEntryOperators(): void {
    if (!this.trainingHeadId) {
      console.error('Training Head ID not found');
      return;
    }

    this.isLoading = true;
    this.dataEntryOperatorService
      .getAllByTrainingHead(this.trainingHeadId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.tableData = response.data;
          } else {
            console.error(
              'Failed to load data entry operators:',
              response.message
            );
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading data entry operators:', error);
          this.isLoading = false;
        },
      });
  }

  onActionClick(event: { action: string; item: any; index: number }): void {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.viewOperatorDetails(item);
        break;
      case 'edit':
        this.editOperator(item);
        break;
      case 'toggle-status':
        this.toggleOperatorStatus(item);
        break;
      case 'delete':
        this.deleteOperator(item);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  private viewOperatorDetails(operator: DataEntryOperator): void {
    console.log('Viewing operator details:', operator);
    // Implement view details functionality
  }

  private editOperator(operator: DataEntryOperator): void {
    console.log('Editing operator:', operator);
    this.editRequested.emit(operator);
  }
  private deleteOperator(operator: DataEntryOperator): void {
    if (!operator?.id) return;

    this.isLoading = true;

    this.userProfileService.deleteDataEntryOperator(operator.id).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.status === 200) {
          this.toastr.success('Deleted Successfully');

          this.loadDataEntryOperators();
        } else {
          this.toastr.error('Delete failed');
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Server error while deleting');
      },
    });
  }

  private toggleOperatorStatus(operator: DataEntryOperator): void {
    console.log('Toggling operator status:', operator);
    // Implement status toggle functionality
  }

  getActiveOperatorsCount(): number {
    return this.tableData.filter((operator) => operator.active).length;
  }

  getInactiveOperatorsCount(): number {
    return this.tableData.filter((operator) => !operator.active).length;
  }

  getRecentAdditions(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return this.tableData.filter((operator) => {
      const createdDate = new Date(operator.createdAt);
      return createdDate >= oneWeekAgo;
    }).length;
  }
}
