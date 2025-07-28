import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';
import { TableComponent, TableColumn, TableAction } from '../../components/table/table.component';

@Component({
  selector: 'app-approved-certificate',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, TableComponent],
  templateUrl: './approved-certificate.component.html',
  styleUrl: './approved-certificate.component.css'
})
export class ApprovedCertificateComponent {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/dashboard/training-module' },
    { label: 'Approved Certificate' }
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
    { name: 'download', icon: 'bi bi-download', class: 'btn-success', title: 'Download' },
  ];

  tableData: any[] = [
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
    { trainingTitle: 'ABC Training', date: '01-May-2025', scheme: 'PMKVY', location: 'Kanpur,Uttar Pradesh', submittedOn: '03-May-2025', status: 'Approved' },
  ];

  handleTableAction(event: { action: string, item: any, index: number }): void {
    console.log('Action:', event.action, 'Item:', event.item);
  }
}
