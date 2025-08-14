import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableComponent, TableColumn, TableAction } from '../../../components/table/table.component';
import { DataEntryOperatorService } from '../services/data-entry-operator.service';
import { DataEntryOperator } from '../models/data-entry-operator.model';

@Component({
  selector: 'app-registered-data-entry-operators',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, TableComponent],
  templateUrl: './registered-data-entry-operators.component.html',
  styleUrl: './registered-data-entry-operators.component.css'
})
export class RegisteredDataEntryOperatorsComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/admin/training-module' },
    { label: 'Registered Data Entry Operators' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'operatorName', header: 'Operator Name' },
    { key: 'designation', header: 'Designation' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'emailId', header: 'Email ID' },
    { key: 'createdBy', header: 'Created By' },
    { key: 'createdAt', header: 'Created Date', transform: (value: string) => {
      return new Date(value).toLocaleDateString('en-IN');
    }},
    { key: 'active', header: 'Status', transform: (value: boolean) => {
      return value ? 'Active' : 'Inactive';
    }}
  ];

  tableActions: TableAction[] = [
    {
      name: 'view',
      icon: 'fas fa-eye',
      class: 'btn-info btn-sm',
      title: 'View Details'
    },
    {
      name: 'edit',
      icon: 'fas fa-edit',
      class: 'btn-warning btn-sm',
      title: 'Edit'
    },
    {
      name: 'toggle-status',
      icon: 'fas fa-toggle-on',
      class: 'btn-secondary btn-sm',
      title: 'Toggle Status'
    }
  ];

  tableData: DataEntryOperator[] = [];
  isLoading = false;
  trainingHeadId: string = '';

  constructor(private dataEntryOperatorService: DataEntryOperatorService) {}

  ngOnInit(): void {
    this.getTrainingHeadId();
    this.loadDataEntryOperators();
  }

  private getTrainingHeadId(): void {
    try {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.trainingHeadId = user.trainingHeadId ;
      }
    } catch (error) {
      console.error('Error parsing user data from session storage:', error);
    }
  }

  loadDataEntryOperators(): void {
    if (!this.trainingHeadId) {
      console.error('Training Head ID not found');
      return;
    }

    this.isLoading = true;
    this.dataEntryOperatorService.getAllByTrainingHead(this.trainingHeadId).subscribe({
      next: (response) => {
        if (response.success) {
          this.tableData = response.data;
        } else {
          console.error('Failed to load data entry operators:', response.message);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data entry operators:', error);
        this.isLoading = false;
      }
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
    // Implement edit functionality
  }

  private toggleOperatorStatus(operator: DataEntryOperator): void {
    console.log('Toggling operator status:', operator);
    // Implement status toggle functionality
  }

  getActiveOperatorsCount(): number {
    return this.tableData.filter(operator => operator.active).length;
  }

  getInactiveOperatorsCount(): number {
    return this.tableData.filter(operator => !operator.active).length;
  }

  getRecentAdditions(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.tableData.filter(operator => {
      const createdDate = new Date(operator.createdAt);
      return createdDate >= oneWeekAgo;
    }).length;
  }
}