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
    { label: 'Dashboard', url: '/admin/role-dashboard' },
    {
      label: 'Schedule Training',
      url: '/admin/training-certificate-generation',
    },
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

  // ✅ For Data Preview + Pagination
  excelData: any[] = [];
  headers: string[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  excelHeaders: string[] = [];
  pagedData: any[] = [];

  get totalPages(): number {
    return Math.ceil(this.excelData.length / this.pageSize);
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.excelData.slice(startIndex, startIndex + this.pageSize);
  }

  constructor(
    private trainingService: TrainingService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.trainingId = this.route.snapshot.queryParams['trainingId'];
    this.getTrainingDetails(this.trainingId);
  }

  getTrainingDetails(trainingId: number) {
    this.isSpinning = true;
    this.trainingService.getTrainingDetails(trainingId).subscribe({
      next: (response) => {
        this.isSpinning = false;
        this.trainingDetails = response;
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }

  onFileSelected(file: File): void {
    this.validationErrors = [];
    this.invalidRowsData = [];
    this.showValidationReport = false;
    this.excelData = [];
    this.headers = [];
    this.currentPage = 1;

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const sheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

      const data: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        header: 1,
      });

      if (data.length > 0) {
        this.headers = data[0]; // ✅ ONLY EXCEL HEADERS — DO NOT PUSH PHOTO HERE

        this.excelData = data.slice(1).map((row) => {
          const obj: any = {};

          this.headers.forEach((h, i) => {
            obj[h] = row[i] ?? '';
          });

          // ✅ Add photo fields safely
          obj.photoPreview = null;
          obj.photoId = null;

          return obj;
        });

        // ✅ AUTO AGE CALCULATION
        const dobHeader = this.headers.find((h) =>
          /dob|date of birth/i.test(h)
        );

        if (dobHeader) {
          let ageHeader = this.headers.find((h) => /^age$/i.test(h));

          if (!ageHeader) {
            const genderIdx = this.headers.findIndex((h) => /gender/i.test(h));
            const insertIdx =
              genderIdx > -1 ? genderIdx : this.excelData.length;
            ageHeader = 'Age';
            this.headers.splice(insertIdx, 0, ageHeader);
          }

          this.excelData = this.excelData.map((row) => {
            const age = this.computeAgeFromDobString(row[dobHeader]);
            return { ...row, [ageHeader]: age };
          });
        }
      }

      this.validateExcelData(this.excelData);
    };

    reader.readAsBinaryString(file);
    this.selectedFile = file;
  }

  onRowPhotoSelected(event: any, row: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // ✅ Preview
    const reader = new FileReader();
    reader.onload = () => {
      row.photoPreview = reader.result;
    };
    reader.readAsDataURL(file);

    // ✅ Upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('photoType', 'TRAINEE');

    this.trainingService.uploadTraineeImage(file, 'Trainee').subscribe({
      next: (res: any) => {
        row.photoId = res?.data?.photoId;
      },
      error: () => {
        alert('Photo upload failed');
      },
    });
  }

  setPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedData = this.excelData.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
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
  }
  convertDateFormat(dateStr: string): string {
    if (!dateStr) return '';

    const [dd, mm, yyyy] = dateStr.split('-');
    return `${yyyy}-${mm}-${dd}`;
  }
  submitData() {
    if (this.errorCount === 0) {
      // this.uploadExcelFile();
      const trainingId = this.trainingId;
      const trainingInstituteId = this.trainingInstituteId;
      console.log(this.paginatedData);
      const convertedData = this.paginatedData.map((row: any) => ({
        name: row['Name'] || '',
        age: row['Age'] || 0,
        gender: row['Gender'] || '',
        contactNumber: row['Contact Number'] || '',
        fatherName: row["Father's Name"] || '',
        email: row['Email'] || '',
        dob: this.convertDateFormat(row['Date of Birth (dd-MM-yyyy)']),
        category: row['Category (GN, OBC, SC, ST )'] || '',
        educationQualification: row['Educational Qualification'] || '',
        recommendedByOrganization: row['Recommended by(organization)'] || '',
        photoId: row['photoId'] || null,
        trainingId: trainingId,
        trainingInstituteId: trainingInstituteId,
      }));
      this.trainingService.submitTrainees(convertedData).subscribe({
      next: (response) => {
        this.isSpinning = false;
        this.toastr.success('Participants submitted successfully!', 'Success');
        this.router.navigate(['/admin/approvedrejectedTrainings']);
      },
      error: (error) => {
        this.isSpinning = false;
        this.toastr.error('Failed to submit participants.', 'Error');
      },
    });
    }
  }

  getInvalidRowColumns(): string[] {
    if (this.invalidRowsData.length === 0) return [];
    // ✅ Use headers so order remains the same
    return this.headers;
  }

  reUploadFile(): void {
    this.showValidationReport = false;
    this.validationErrors = [];
    this.invalidRowsData = [];
    this.uploadProgress = 0;
    this.excelData = [];
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
      error: () => {
        this.toastr.error('Bulk Upload Template Not Downloaded', 'Error');
        this.isSpinning = false;
      },
    });
  }

  uploadExcelFile(): void {
    const trainingId = this.trainingId;
    this.isSpinning = true;
    if (this.user) {
      const user = JSON.parse(this.user);
      this.trainingInstituteId = user.trainingHeadId;
    }

    if (this.selectedFile) {
      this.trainingService
        .uploadTraineeExcel(
          this.selectedFile,
          trainingId,
          this.trainingInstituteId
        )
        .subscribe({
          next: () => {
            this.isSpinning = false;
            this.toastr.success('Bulk Excel File Uploaded', 'Success');
            this.router.navigate(['/admin/approvedrejectedTrainings']);
          },
          error: () => {
            this.isSpinning = false;
            this.toastr.error('Bulk Excel File Not Uploaded', 'Error');
          },
        });
    }
  }

  private computeAgeFromDobString(dobValue: any): number | '' {
    if (!dobValue) return '';
    const normalized: string = String(dobValue)
      .trim()
      .replace(/[\.\/]/g, '-');
    const parts: string[] = normalized.split('-').map((p: string) => p.trim());

    let dob: Date;
    if (parts.length === 3) {
      // Handle dd-mm-yyyy and yyyy-mm-dd
      if (parts[0].length === 4) {
        dob = new Date(+parts[0], +parts[1] - 1, +parts[2]);
      } else {
        dob = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      }
    } else {
      dob = new Date(dobValue);
    }

    if (isNaN(dob.getTime())) return '';

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age >= 0 && age <= 120 ? age : '';
  }
}
