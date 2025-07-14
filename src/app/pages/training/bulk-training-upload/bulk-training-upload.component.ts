import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableComponent, TableColumn, TableAction } from '../../../components/table/table.component';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';

@Component({
  selector: 'app-bulk-training-upload',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, TableComponent, FileUploadComponent],
  templateUrl: './bulk-training-upload.component.html',
  styleUrl: './bulk-training-upload.component.css'
})
export class BulkTrainingUploadComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Institute Login', url: '/training-module' },
    { label: 'Training Certificate generation', url: '/training-certificate-generation' },
    { label: 'Bulk Upload' }
  ];

  validationErrors: any[] = [];
  tableColumns: TableColumn[] = [
    { key: 'row', header: 'Row' },
    { key: 'column', header: 'Column' },
    { key: 'errorMessage', header: 'Error Message' }
  ];
  tableActions: TableAction[] = [
    { name: 'edit', icon: 'bi-pencil', class: 'btn-edit', title: 'Edit' },
    { name: 'delete', icon: 'bi-trash', class: 'btn-delete', title: 'Delete' },
    { name: 'view', icon: 'bi-eye', class: 'btn-view', title: 'View' }
  ];

  uploadProgress = 50;
  errorCount = 10;
  errorRowCount = 4;
  showValidationReport = true; // Show by default to match figma

  constructor() { }

  ngOnInit(): void {
    this.loadSampleErrors();
  }

  onFileSelected(file: File): void {
    this.showValidationReport = true;
    // Simulate upload and validation
    console.log('File selected:', file);
  }

  reUploadFile(): void {
    this.showValidationReport = false;
  }

  handleTableAction(event: { action: string, item: any, index: number }): void {
    console.log('Action:', event.action, 'Item:', event.item);
  }

  loadSampleErrors(): void {
    this.validationErrors = [
      { row: '03', column: 'Manoj Kumar', errorMessage: 'Contact number is missing' },
      { row: '05', column: 'Suman Devi', errorMessage: 'Invalid aadhar format' },
      { row: '03', column: 'Manoj Kumar', errorMessage: 'Contact number is missing' },
      { row: '05', column: 'Suman Devi', errorMessage: 'Invalid aadhar format' },
      { row: '03', column: 'Manoj Kumar', errorMessage: 'Contact number is missing' },
      { row: '05', column: 'Suman Devi', errorMessage: 'Invalid aadhar format' },
      { row: '03', column: 'Manoj Kumar', errorMessage: 'Contact number is missing' },
      { row: '05', column: 'Suman Devi', errorMessage: 'Invalid aadhar format' },
      { row: '03', column: 'Manoj Kumar', errorMessage: 'Contact number is missing' },
      { row: '05', column: 'Suman Devi', errorMessage: 'Invalid aadhar format' },
    ];
  }
}
