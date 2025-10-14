import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';
import { TableComponent, TableColumn, TableAction } from '../../components/table/table.component';

@Component({
  selector: 'app-certificate-approval',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, TableComponent],
  templateUrl: './certificate-approval.component.html',
  styleUrls: ['./certificate-approval.component.css']
})
export class CertificateApprovalComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Central Admin Login', url: '/admin/training-module' },
    { label: 'Certificate Approval' }
  ];

  tableColumns: TableColumn[] = [
    { key: 'trainingTitle', header: 'Training Title' },
    { key: 'institute', header: 'Institute' },
    { key: 'date', header: 'Date' },
    { key: 'noOfTrainees', header: 'No. of Trainees' },
    { key: 'submittedOn', header: 'Submitted On' },
    { key: 'status', header: 'Status' }
  ];

  tableActions: TableAction[] = [
    { name: 'view', icon: 'bi bi-file-earmark-text', class: 'btn-outline-primary', title: 'View Certificate' }
  ];

  tableData: any[] = [
    {
      trainingTitle: 'Cooperative Functioning in Dairying',
      institute: 'ABC Inst.',
      date: '01-Jul-25',
      noOfTrainees: 34,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Clean Milk Production Techniques',
      institute: 'Amrit Dairy',
      date: '01-Jul-25',
      noOfTrainees: 24,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Cooperative Functioning in Dairying',
      institute: 'ABC Inst.',
      date: '01-Jul-25',
      noOfTrainees: 34,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Clean Milk Production Techniques',
      institute: 'Amrit Dairy',
      date: '01-Jul-25',
      noOfTrainees: 24,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Cooperative Functioning in Dairying',
      institute: 'ABC Inst.',
      date: '01-Jul-25',
      noOfTrainees: 34,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Clean Milk Production Techniques',
      institute: 'Amrit Dairy',
      date: '01-Jul-25',
      noOfTrainees: 24,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Cooperative Functioning in Dairying',
      institute: 'ABC Inst.',
      date: '01-Jul-25',
      noOfTrainees: 34,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Clean Milk Production Techniques',
      institute: 'Amrit Dairy',
      date: '01-Jul-25',
      noOfTrainees: 24,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Cooperative Functioning in Dairying',
      institute: 'ABC Inst.',
      date: '01-Jul-25',
      noOfTrainees: 34,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    },
    {
      trainingTitle: 'Clean Milk Production Techniques',
      institute: 'Amrit Dairy',
      date: '01-Jul-25',
      noOfTrainees: 24,
      submittedOn: '03-Jul-25',
      status: 'Under Review'
    }
  ];

  handleTableAction(event: { action: string, item: any, index: number }): void {
    // Handle certificate approval actions here
  }
}