import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { TrainingService } from '../../../pages/training/services/training.service';

@Component({
  selector: 'app-bulk-training-upload',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, FileUploadComponent],
  templateUrl: './bulk-training-upload.component.html',
  styleUrl: './bulk-training-upload.component.css',
})
export class BulkTrainingUploadComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Bulk Training Upload' },
  ];

  validationErrors: any[] = [];
  invalidRowsData: any[] = [];

  uploadProgress = 0;
  errorCount = 0;
  errorRowCount = 0;
  showValidationReport = false;
  isSpinning: boolean = false;
  fileUploadKey = Date.now();
  showFileUpload = true;
  selectedFile: File | undefined;
  trainingDetails: any = null;
  trainingId: any;
  trainingInstituteId: any;
  user: any = sessionStorage.getItem('user');

  constructor(
    private trainingService: TrainingService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get query params from snapshot (one-time read)
    this.trainingId = this.route.snapshot.queryParams['trainingId'];

    // Apply delay if needed
    this.getTrainingDetails(this.trainingId);
  }
  getTrainingDetails(trainingId: number) {
    this.isSpinning = true;
    this.trainingService.getTrainingDetails(trainingId).subscribe({
      next: (response) => {
        this.isSpinning = false;
        console.log(response);
        this.trainingDetails = response;
      },
      error: (error) => {
        this.isSpinning = false;
      },
    });
  }

  onFileSelected(file: File): void {
    this.validationErrors = [];
    this.invalidRowsData = [];
    this.showValidationReport = false;

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      this.validateExcelData(data);
    };

    reader.readAsBinaryString(file);
    this.selectedFile = file;
  }
  groupValidationErrorsByRow(): { row: number; errors: any[] }[] {
    const grouped: { [key: number]: any[] } = {};

    for (const error of this.validationErrors) {
      if (!grouped[error.row]) {
        grouped[error.row] = [];
      }
      grouped[error.row].push(error);
    }

    return Object.keys(grouped).map((row) => ({
      row: Number(row),
      errors: grouped[Number(row)],
    }));
  }

  validateExcelData(data: any[]): void {
    const rawErrors: any[] = [];

    data.forEach((row, index) => {
      const excelRow = index + 2;

      // Track all errors for this row
      const rowErrors: { column: string; message: string }[] = [];

      const gender = (row['Gender'] || '').toString().toLowerCase();
      if (!['male', 'female', 'others'].includes(gender)) {
        rowErrors.push({
          column: 'Gender',
          message: 'Gender must be Male, Female, or Others',
        });
      }

      const contact = row['Contact Number']?.toString() || '';
      if (!/^\d{10}$/.test(contact)) {
        rowErrors.push({
          column: 'Contact Number',
          message: 'Contact Number must be exactly 10 digits',
        });
      }

      const email = row['Email'] || '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toString().toLowerCase())) {
        rowErrors.push({
          column: 'Email',
          message: 'Email format is invalid',
        });
      }

      if (rowErrors.length > 0) {
        rawErrors.push({
          row: excelRow,
          column: rowErrors.map((e) => e.column).join(', '),
          errorMessage: rowErrors.map((e) => e.message).join('. ') + '.',
        });
      }
    });

    this.validationErrors = rawErrors;
    this.errorCount = rawErrors.length;
    this.errorRowCount = new Set(rawErrors.map((e) => e.row)).size;
    if (this.errorCount > 0) {
      this.showValidationReport = true;
    }

    const invalidRowNumbers = new Set(rawErrors.map((e) => e.row));
    this.invalidRowsData = data
      .map((row, index) => ({ rowNumber: index + 2, ...row }))
      .filter((row) => invalidRowNumbers.has(row.rowNumber));

    if (this.errorCount == 0) {
      this.uploadExcelFile();
    }
  }

  getInvalidRowColumns(): string[] {
    if (this.invalidRowsData.length === 0) return [];
    const allKeys = Object.keys(this.invalidRowsData[0]);
    return allKeys.filter((k) => k !== 'rowNumber');
  }

  reUploadFile(): void {
    this.showValidationReport = false;
    this.validationErrors = [];
    this.invalidRowsData = [];
    this.uploadProgress = 0;

    this.showFileUpload = false;
    setTimeout(() => {
      this.showFileUpload = true;
    }, 0);
  }

  downloadExcelTemplate(): void {
    this.isSpinning = true;
    this.trainingService.downloadExcelFile().subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TraineeTemplate.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Bulk Upload Template Downloaded', 'Success');
        this.isSpinning = false;
      },
      error: (error) => {
        console.error('Error downloading the Excel template:', error);
        this.toastr.error('Bulk Upload Template Not Downloaded', 'Error');
        this.isSpinning = false;
      },
    });
  }
  uploadExcelFile(): void {
    // const trainingId = 10;
    const trainingId = this.trainingId;
    this.isSpinning = true;
    if (this.user) {
      const user = JSON.parse(this.user);
      this.trainingInstituteId = user.trainingHeadId;
    }

    if (this.selectedFile != undefined) {
      this.trainingService
        .uploadTraineeExcel(
          this.selectedFile,
          trainingId,
          this.trainingInstituteId
        )
        .subscribe({
          next: (response) => {
            this.isSpinning = false;
            console.log('File uploaded successfully:', response);
            this.toastr.success('Bulk Excel File Uploaded', 'Success');
            this.router.navigate(['/admin/training-module']);
          },
          error: (error) => {
            this.isSpinning = false;
            console.error('File upload failed:', error);
            this.toastr.error('Bulk Excel File Not Uploaded', 'Error');
          },
        });
    }
  }
}
