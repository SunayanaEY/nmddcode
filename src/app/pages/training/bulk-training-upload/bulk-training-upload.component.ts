import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { FileUploadComponent } from '../../../components/file-upload/file-upload.component';
import { TrainingService } from '../../../pages/training/services/training.service';
import { AdminService } from '../services/training-admin.service';
import { saveAs } from 'file-saver';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import {
  CroppedImageResult,
  ImageCropperModalComponent,
} from '../../../components/image-cropper-modal/image-cropper-modal.component';

@Component({
  selector: 'app-bulk-training-upload',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    FileUploadComponent,
    TranslateModule,
    FormsModule,
    ImageCropperModalComponent,
  ],
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

  prefixArray: string[] = [];
  // prefixSet: boolean = false;
  validationErrors: any[] = [];
  invalidRowsData: any[] = [];
  prefixes: string[] = ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof'];
  uploadProgress = 0;
  errorCount = 0;
  errorRowCount = 0;
  showValidationReport = false;
  isSpinning: boolean = false;
  fileUploadKey = Date.now();
  showFileUpload = true;
  selectedFile: File | undefined;
  trainingDetails: any = null;
  trainingScheduleUrl: string | null = null;
  isLoadingSchedule: boolean = false;
  trainingId: any;
  trainingInstituteId: any;
  user: any = sessionStorage.getItem('user');

  excelData: any[] = [];
  headers: string[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  excelHeaders: string[] = [];
  pagedData: any[] = [];
  showImageCropper = false;
  cropperInputFile: File | null = null;
  cropperOriginalFileName = 'trainee-photo.jpg';
  activePhotoRow: any | null = null;
  previewRowErrors: { [key: number]: string[] } = {};

  get totalPages(): number {
    return Math.ceil(this.excelData.length / this.pageSize);
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.prefixArray = new Array(this.pageSize).fill('Mr');
    const data = this.excelData.slice(startIndex, startIndex + this.pageSize);
    if (this.prefixSet) {
      return data;
    }
    data.forEach((item) => {
      item.Name = `Mr ${item.Name}`;
    });
    this.prefixSet = true;
    return data;
  }

  constructor(
    private trainingService: TrainingService,
    private adminService: AdminService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.trainingId = this.route.snapshot.queryParams['trainingId'];
    if (this.user) {
      try {
        const parsedUser = JSON.parse(this.user);
        this.trainingInstituteId = parsedUser.trainingHeadId;
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    this.getTrainingDetails(this.trainingId);
  }

  getTrainingDetails(trainingId: number) {
    this.isSpinning = true;
    this.trainingService.getTrainingDetails(trainingId).subscribe({
      next: (response) => {
        this.isSpinning = false;
        this.trainingDetails = response;
        this.prepareTrainingScheduleUrl();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }

  async toBlobUrl(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.adminService.downloadInstituteImage(fileName).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          resolve(url);
        },
        error: (err) => {
          console.error('Error fetching file blob:', err);
          reject(err);
        },
      });
    });
  }

  async prepareTrainingScheduleUrl() {
    this.trainingScheduleUrl = null;
    this.isLoadingSchedule = false;

    if (this.trainingDetails?.trainingScheduleDetail) {
      try {
        this.isLoadingSchedule = true;
        this.trainingScheduleUrl = await this.toBlobUrl(
          this.trainingDetails.trainingScheduleDetail,
        );
      } catch (error) {
        console.error('Failed to load training schedule:', error);
        this.trainingScheduleUrl = null;
      } finally {
        this.isLoadingSchedule = false;
      }
    }
  }

  onFileSelected(file: File): void {
    this.validationErrors = [];
    this.invalidRowsData = [];
    this.showValidationReport = false;
    this.previewRowErrors = {};
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
        this.headers = data[0];

        this.excelData = data
          .slice(1)
          .filter((row) => {
            // Check if row has at least one non-empty cell
            return row.some((cell: any) => {
              return (
                cell !== null &&
                cell !== undefined &&
                cell !== '' &&
                String(cell).trim() !== ''
              );
            });
          })
          .map((row) => {
            const obj: any = {};

            this.headers.forEach((h, i) => {
              obj[h] = row[i] ?? '';
            });

            // Add photo fields safely
            obj.photoPreview = null;
            obj.photoId = null;
            obj.honorific = '';
            obj.honorificError = false;

            return obj;
          });

        const dobHeader = this.headers.find((h) =>
          /dob|date of birth/i.test(h),
        );

        if (dobHeader) {
          let ageHeader = this.headers.find((h) => /^age$/i.test(h));

          if (!ageHeader) {
            const genderIdx = this.headers.findIndex((h) => /gender/i.test(h));
            const insertIdx =
              genderIdx > -1 ? genderIdx + 1 : this.headers.length;
            ageHeader = 'Age';
            this.headers.splice(insertIdx, 0, ageHeader);
          }

          this.excelData = this.excelData.map((row) => {
            const normalizedDob = this.normalizeDobCell(row[dobHeader]);
            const age = this.computeAgeFromDobString(normalizedDob);
            return { ...row, [dobHeader]: normalizedDob, [ageHeader]: age };
          });
        }
      }

      this.validateExcelData(this.excelData);
    };

    reader.readAsBinaryString(file);
    this.selectedFile = file;
  }

  // async generateTemplate() {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet('User Data');

  //   const MAX_ROWS = 1000;

  //   // Define headers
  //   worksheet.columns = [
  //     { header: 'Name', key: 'name', width: 20 },
  //     { header: 'Gender', key: 'gender', width: 12 },
  //     { header: 'Contact Number', key: 'contact', width: 18 },
  //     { header: "Father's Name", key: 'fatherName', width: 20 },
  //     { header: 'Email', key: 'email', width: 25 },
  //     { header: 'Date of Birth (dd-MM-yyyy)', key: 'dob', width: 25 },
  //     { header: 'Category (GN, OBC, SC, ST)', key: 'category', width: 25 },
  //     { header: 'Educational Qualification', key: 'education', width: 30 },
  //     {
  //       header: 'Recommended by (Organization)',
  //       key: 'recommendedBy',
  //       width: 30,
  //     },
  //   ];

  //   worksheet.getRow(1).font = { bold: true };
  //   worksheet.getRow(1).fill = {
  //     type: 'pattern',
  //     pattern: 'solid',
  //     fgColor: { argb: 'FFD3D3D3' },
  //   };

  //   for (let i = 2; i <= MAX_ROWS; i++) {
  //     worksheet.addRow({});
  //   }

  //   for (let row = 2; row <= MAX_ROWS; row++) {
  //     worksheet.getCell(`B${row}`).dataValidation = {
  //       type: 'list',
  //       allowBlank: false,
  //       formulae: ['"Male,Female,Others"'],
  //       showErrorMessage: true,
  //       errorStyle: 'error',
  //       errorTitle: 'Invalid Gender',
  //       error: 'Please select from the dropdown: Male, Female, or Others',
  //     };

  //     // ✅ Contact Number Validation (Column C)
  //     worksheet.getCell(`C${row}`).dataValidation = {
  //       type: 'custom',
  //       allowBlank: false,
  //       formulae: [
  //         `AND(LEN(C${row})=10,ISNUMBER(VALUE(C${row})),VALUE(C${row})>=1000000000,VALUE(C${row})<=9999999999)`,
  //       ],
  //       showErrorMessage: true,
  //       errorStyle: 'error',
  //       errorTitle: 'Invalid Contact Number',
  //       error: 'Contact number must be exactly 10 digits',
  //     };

  //     worksheet.getCell(`C${row}`).numFmt = '@';

  //     // ✅ Email Validation (Column E)
  //     worksheet.getCell(`E${row}`).dataValidation = {
  //       type: 'custom',
  //       allowBlank: false,
  //       formulae: [
  //         `AND(ISNUMBER(SEARCH("@",E${row})),ISNUMBER(SEARCH(".",E${row})),LEN(E${row})>5)`,
  //       ],
  //       showErrorMessage: true,
  //       errorStyle: 'error',
  //       errorTitle: 'Invalid Email',
  //       error: 'Please enter a valid email',
  //     };

  //     // ✅ DOB Validation as TEXT (Column F)
  //     worksheet.getCell(`F${row}`).dataValidation = {
  //       type: 'custom',
  //       allowBlank: false,
  //       formulae: [
  //         `AND(
  //         LEN(F${row})=10,
  //         MID(F${row},3,1)="-",
  //         MID(F${row},6,1)="-",
  //         VALUE(LEFT(F${row},2))>=1,
  //         VALUE(LEFT(F${row},2))<=31,
  //         VALUE(MID(F${row},4,2))>=1,
  //         VALUE(MID(F${row},4,2))<=12,
  //         VALUE(RIGHT(F${row},4))>=1910,
  //         VALUE(RIGHT(F${row},4))<=2100
  //       )`,
  //       ],
  //       showErrorMessage: true,
  //       errorStyle: 'error',
  //       errorTitle: 'Invalid Date Format',
  //       error: 'Use dd-MM-yyyy between year 1910–2100',
  //     };

  //     worksheet.getCell(`F${row}`).numFmt = '@';

  //     // ✅ Category Dropdown (Column G)
  //     worksheet.getCell(`G${row}`).dataValidation = {
  //       type: 'list',
  //       allowBlank: false,
  //       formulae: ['"GN,OBC,SC,ST"'],
  //       showErrorMessage: true,
  //       errorStyle: 'error',
  //       errorTitle: 'Invalid Category',
  //       error: 'Select GN, OBC, SC, or ST',
  //     };
  //   }

  //   // ✅ Generate Excel file
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //   });

  //   saveAs(blob, 'Excel_Template.xlsx');
  // }
  async generateTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Data');

    const MAX_ROWS = 1000;

    // Define headers
    worksheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Gender', key: 'gender', width: 12 },
      { header: 'Contact Number', key: 'contact', width: 18 },
      { header: "Father's Name", key: 'fatherName', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      // 🔁 Updated header to reflect both allowed formats
      {
        header: 'Date of Birth (dd-MM-yyyy or dd/MM/yyyy)',
        key: 'dob',
        width: 30,
      },
      { header: 'Category (GN, OBC, SC, ST)', key: 'category', width: 25 },
      { header: 'Educational Qualification', key: 'education', width: 30 },
      {
        header: 'Recommended by (Organization)',
        key: 'recommendedBy',
        width: 30,
      },
    ];

    // Header styling
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Create empty rows up to MAX_ROWS
    for (let i = 2; i <= MAX_ROWS; i++) {
      worksheet.addRow({});
    }

    for (let row = 2; row <= MAX_ROWS; row++) {
      // Gender (Column B) - List
      worksheet.getCell(`B${row}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"Male,Female,Others"'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Gender',
        error: 'Please select from the dropdown: Male, Female, or Others',
      };

      // Contact Number (Column C) - exactly 10 digits (numeric range)
      worksheet.getCell(`C${row}`).dataValidation = {
        type: 'custom',
        allowBlank: false,
        formulae: [
          `AND(LEN(C${row})=10,ISNUMBER(VALUE(C${row})),VALUE(C${row})>=1000000000,VALUE(C${row})<=9999999999)`,
        ],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Contact Number',
        error: 'Contact number must be exactly 10 digits',
      };
      // Keep as text so leading zeros (if ever needed) are preserved visually
      worksheet.getCell(`C${row}`).numFmt = '@';

      // Email (Column E) - basic sanity check
      worksheet.getCell(`E${row}`).dataValidation = {
        type: 'custom',
        allowBlank: false,
        formulae: [
          `AND(ISNUMBER(SEARCH("@",E${row})),ISNUMBER(SEARCH(".",E${row})),LEN(E${row})>5)`,
        ],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Email',
        error: 'Please enter a valid email',
      };

      // Keep DOB as text so Excel doesn't auto-convert/reformat
      worksheet.getCell(`F${row}`).numFmt = '@';

      // Category (Column G) - List
      worksheet.getCell(`G${row}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: ['"GN,OBC,SC,ST"'],
        showErrorMessage: true,
        errorStyle: 'error',
        errorTitle: 'Invalid Category',
        error: 'Select GN, OBC, SC, or ST',
      };
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'Excel_Template.xlsx');
  }

  onRowPrefixSelected(event: any, row: any) {
    const selectedPrefix = event?.target?.value ?? '';
    row.honorific = selectedPrefix;
    row.honorificError = !selectedPrefix;
    const baseName = this.getBaseNameForHonorific(row);

    row.Name = selectedPrefix
      ? `${selectedPrefix} ${baseName}`.trim()
      : baseName;
  }

  private getBaseNameForHonorific(row: any): string {
    const cachedBaseName = (row?._baseName ?? '').toString().trim();
    if (cachedBaseName) {
      return cachedBaseName;
    }

    const originalName = (row?.Name ?? '').toString().trim();
    if (!originalName) {
      row._baseName = '';
      return '';
    }

    const escapedPrefixes = this.prefixes.map((prefix) =>
      prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    );
    const prefixRegex = new RegExp(
      `^(?:${escapedPrefixes.join('|')})\\.?\\s+`,
      'i',
    );
    const baseName = originalName.replace(prefixRegex, '').trim() || originalName;
    row._baseName = baseName;
    return baseName;
  }

  private validateHonorificSelection(): boolean {
    const invalidRows = this.excelData.filter(
      (row: any) => !(row?.honorific || '').toString().trim(),
    );
    this.excelData.forEach((row: any) => {
      row.honorificError = !(row?.honorific || '').toString().trim();
    });
    if (invalidRows.length > 0) {
      this.toastr.error(
        'Please select Honorifics for all participants before submitting.',
        'Validation Error',
      );
      return false;
    }
    return true;
  }
  onRowPhotoSelected(event: any, row: any) {
    const file: File | null = event?.target?.files?.[0] || null;
    if (event?.target) {
      event.target.value = '';
    }
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastr.error('Only image files are allowed!', 'Invalid File');
      return;
    }

    this.cropperOriginalFileName = file.name || 'trainee-photo.jpg';
    this.cropperInputFile = file;
    this.activePhotoRow = row;
    this.showImageCropper = true;
  }

  onRowPhotoCropCanceled(): void {
    this.showImageCropper = false;
    this.cropperInputFile = null;
    this.activePhotoRow = null;
  }

  onRowPhotoCropLoadFailed(): void {
    this.toastr.error('Please select a valid image file', 'File Error');
    this.onRowPhotoCropCanceled();
  }

  onRowPhotoCropApplied(event: CroppedImageResult): void {
    if (!this.activePhotoRow) {
      this.onRowPhotoCropCanceled();
      return;
    }

    const selectedRow = this.activePhotoRow;
    const croppedFile = new File(
      [event.blob],
      this.createCroppedFileName(this.cropperOriginalFileName, event.mimeType),
      { type: event.mimeType },
    );

    selectedRow.photoPreview = event.previewUrl;
    selectedRow.photoId = null;
    this.showImageCropper = false;
    this.cropperInputFile = null;
    this.activePhotoRow = null;

    this.trainingService.uploadTraineeImage(croppedFile, 'trainee').subscribe({
      next: (res: any) => {
        selectedRow.photoId = res?.data?.photoId ?? null;
      },
      error: () => {
        selectedRow.photoId = null;
        this.toastr.error('Photo upload failed', 'Error');
      },
    });
  }

  private createCroppedFileName(originalFileName: string, mimeType: string): string {
    const baseName =
      originalFileName.replace(/\.[^/.]+$/, '') || 'trainee-photo';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      return `${baseName}-cropped.jpg`;
    }
    if (mimeType.includes('webp')) {
      return `${baseName}-cropped.webp`;
    }
    return `${baseName}-cropped.png`;
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

  getPreviewRowNumber(pageIndex: number): number {
    return (this.currentPage - 1) * this.pageSize + pageIndex + 1;
  }

  private getValidationMessagesForRow(rowNumber: number): string[] {
    const messages: string[] = [];

    const previewErrors = this.previewRowErrors[rowNumber];
    if (Array.isArray(previewErrors) && previewErrors.length > 0) {
      messages.push(...previewErrors);
    }

    const rowErrors = this.validationErrors
      .filter((error) => Number(error?.row) === rowNumber)
      .map((error) => (error?.errorMessage || '').toString().trim())
      .filter((message) => message.length > 0);
    if (rowErrors.length > 0) {
      messages.push(...rowErrors);
    }

    return [...new Set(messages)];
  }

  hasValidationErrorForPreviewRow(pageIndex: number): boolean {
    const rowNumber = this.getPreviewRowNumber(pageIndex);
    return this.getValidationMessagesForRow(rowNumber).length > 0;
  }

  hasPreviewRowError(pageIndex: number): boolean {
    const rowNumber = this.getPreviewRowNumber(pageIndex);
    const errors = this.previewRowErrors[rowNumber];
    return Array.isArray(errors) && errors.length > 0;
  }

  getPreviewRowErrorReason(pageIndex: number): string {
    const rowNumber = this.getPreviewRowNumber(pageIndex);
    const errors = this.getValidationMessagesForRow(rowNumber);
    if (errors.length === 0) {
      return '-';
    }
    return errors.join(' | ');
  }

  get hasServerRowErrors(): boolean {
    return Object.keys(this.previewRowErrors).length > 0;
  }

  get hasAnyPreviewErrors(): boolean {
    return (
      this.validationErrors.length > 0 || Object.keys(this.previewRowErrors).length > 0
    );
  }

  removeErroredPreviewRow(pageIndex: number): void {
    if (!this.hasValidationErrorForPreviewRow(pageIndex)) {
      return;
    }

    const rowNumber = this.getPreviewRowNumber(pageIndex);
    const dataIndex = rowNumber - 1;
    if (dataIndex < 0 || dataIndex >= this.excelData.length) {
      return;
    }

    this.excelData.splice(dataIndex, 1);
    this.reindexValidationArtifactsAfterRowRemoval(rowNumber);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    if (this.totalPages === 0) {
      this.currentPage = 1;
    }
  }

  private reindexValidationArtifactsAfterRowRemoval(removedRowNumber: number): void {
    const updatedPreviewErrors: { [key: number]: string[] } = {};

    Object.keys(this.previewRowErrors).forEach((key) => {
      const row = Number(key);
      if (Number.isNaN(row) || row === removedRowNumber) {
        return;
      }

      const shiftedRow = row > removedRowNumber ? row - 1 : row;
      updatedPreviewErrors[shiftedRow] = this.previewRowErrors[row];
    });
    this.previewRowErrors = updatedPreviewErrors;

    this.validationErrors = (this.validationErrors || [])
      .filter((error) => Number(error?.row) !== removedRowNumber)
      .map((error) => {
        const row = Number(error?.row);
        if (!Number.isNaN(row) && row > removedRowNumber) {
          return { ...error, row: row - 1 };
        }
        return error;
      });

    this.errorCount = this.validationErrors.length;
    this.errorRowCount = new Set(this.validationErrors.map((e) => Number(e.row))).size;
    this.showValidationReport = this.errorCount > 0;

    const invalidRowNumbers = new Set(this.validationErrors.map((e) => Number(e.row)));
    this.invalidRowsData = this.excelData
      .map((row, index) => ({ rowNumber: index + 1, ...row }))
      .filter((row) => invalidRowNumbers.has(row.rowNumber));
  }

  private parseSubmitResponse(response: any): any {
    if (response && typeof response === 'object') {
      return response;
    }
    if (typeof response === 'string') {
      try {
        return JSON.parse(response);
      } catch {
        return null;
      }
    }
    return null;
  }

  private clearServerRowErrors(): void {
    this.previewRowErrors = {};
  }

  private syncServerValidationReportFromPreviewErrors(): void {
    const rows = Object.keys(this.previewRowErrors)
      .map((row) => Number(row))
      .filter((row) => !Number.isNaN(row))
      .sort((a, b) => a - b);

    const serverValidationErrors: any[] = [];
    for (const row of rows) {
      const messages = this.previewRowErrors[row] || [];
      if (!messages.length) {
        continue;
      }
      serverValidationErrors.push({
        row,
        column: 'Server Validation',
        errorMessage: messages.join(' | '),
      });
    }

    this.validationErrors = serverValidationErrors;
    this.errorCount = serverValidationErrors.length;
    this.errorRowCount = rows.length;
    this.showValidationReport = serverValidationErrors.length > 0;
  }

  private rebuildServerErrorsAfterRowRemoval(removedRowNumber: number): void {
    const updatedErrors: { [key: number]: string[] } = {};

    Object.keys(this.previewRowErrors).forEach((key) => {
      const row = Number(key);
      if (Number.isNaN(row) || row === removedRowNumber) {
        return;
      }

      const shiftedRow = row > removedRowNumber ? row - 1 : row;
      updatedErrors[shiftedRow] = this.previewRowErrors[row];
    });

    this.previewRowErrors = updatedErrors;
    this.syncServerValidationReportFromPreviewErrors();
  }

  private mapApiIndexToPreviewRow(errorItem: any): number | null {
    const rawIndex = Number(errorItem?.index);
    if (Number.isNaN(rawIndex)) {
      return null;
    }

    const candidates = [rawIndex, rawIndex - 1].filter(
      (index, pos, arr) =>
        index >= 0 && index < this.excelData.length && arr.indexOf(index) === pos,
    );

    if (candidates.length === 0) {
      return null;
    }

    const apiName = (errorItem?.name || '').toString().trim().toLowerCase();
    if (apiName) {
      for (const candidate of candidates) {
        const rowName = (this.excelData[candidate]?.Name || '')
          .toString()
          .trim()
          .toLowerCase();
        if (rowName && rowName === apiName) {
          return candidate + 1;
        }
      }
    }

    return candidates.includes(rawIndex - 1) ? rawIndex : rawIndex + 1;
  }

  private applyServerErrorsToPreview(responseBody: any): boolean {
    const apiErrors = Array.isArray(responseBody?.errors) ? responseBody.errors : [];
    if (apiErrors.length === 0) {
      this.clearServerRowErrors();
      return false;
    }

    this.clearServerRowErrors();

    const serverValidationErrors: any[] = [];
    for (const item of apiErrors) {
      const rowNumber = this.mapApiIndexToPreviewRow(item);
      const messages = Array.isArray(item?.messages)
        ? item.messages.filter((msg: any) => typeof msg === 'string' && msg.trim())
        : [];
      if (!rowNumber || messages.length === 0) {
        continue;
      }

      const existing = this.previewRowErrors[rowNumber] || [];
      this.previewRowErrors[rowNumber] = [...existing, ...messages];
      serverValidationErrors.push({
        row: rowNumber,
        column: 'Server Validation',
        errorMessage: messages.join(' | '),
      });
    }

    if (serverValidationErrors.length > 0) {
      this.validationErrors = serverValidationErrors;
      this.errorCount = serverValidationErrors.length;
      this.errorRowCount = Object.keys(this.previewRowErrors).length;
      this.showValidationReport = true;
      return true;
    }

    return false;
  }

  validateExcelData(data: any[]): void {
    const rawErrors: any[] = [];

    data.forEach((row, index) => {
      const excelRow = index + 1;
      const rowErrors: { column: string; message: string }[] = [];

      // ✅ Check if row is actually empty (all fields are empty)
      const hasAnyData = Object.values(row).some((value) => {
        if (value === 'photoPreview' || value === 'photoId') return false;
        return (
          value !== null && value !== undefined && String(value).trim() !== ''
        );
      });

      // ✅ Skip validation for completely empty rows
      if (!hasAnyData) {
        return;
      }

      // Name validation
      const name = (row['Name'] || '').toString().trim();
      if (!name) {
        rowErrors.push({
          column: 'Name',
          message: 'Name is required',
        });
      }

      // Gender validation
      const gender = (row['Gender'] || '').toString().toLowerCase().trim();
      if (!['male', 'female', 'others'].includes(gender)) {
        rowErrors.push({
          column: 'Gender',
          message: 'Gender must be Male, Female, or Others',
        });
      }

      // Contact validation
      const contact = row['Contact Number']?.toString().trim() || '';
      if (!/^\d{10}$/.test(contact)) {
        rowErrors.push({
          column: 'Contact Number',
          message: 'Contact Number must be exactly 10 digits',
        });
      }

      // Father's Name validation
      const fatherName = (row["Father's Name"] || '').toString().trim();
      if (!fatherName) {
        rowErrors.push({
          column: "Father's Name",
          message: "Father's Name is required",
        });
      }

      // Email validation
      const email = (row['Email'] || '').toString().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase())) {
        rowErrors.push({
          column: 'Email',
          message: 'Email format is invalid',
        });
      }

      // DOB validation
      const dobHeader = this.getDobHeaderFromRow(row);
      const dob = (dobHeader ? row[dobHeader] : '').toString().trim();
      const dobRegex =
        /^(0[1-9]|[12][0-9]|3[01])([\/-])(0[1-9]|1[0-2])\2\d{4}$/;
      if (!dobRegex.test(dob)) {
        rowErrors.push({
          column: 'Date of Birth',
          message: 'DOB must be in dd-MM-yyyy or dd/MM/yyyy format',
        });
      } else {
        const ageFromDob = this.computeAgeFromDobString(dob);
        if (typeof ageFromDob === 'number' && ageFromDob < 18) {
          rowErrors.push({
            column: 'Date of Birth',
            message: 'Trainees under 18 years are not allowed',
          });
        }
      }

      // Category validation
      const category = (row['Category (GN, OBC, SC, ST)'] || '')
        .toString()
        .trim()
        .toUpperCase();
      if (!['GN', 'OBC', 'SC', 'ST'].includes(category)) {
        rowErrors.push({
          column: 'Category',
          message: 'Category must be GN, OBC, SC, or ST',
        });
      }

      // Educational Qualification validation
      const education = (row['Educational Qualification'] || '')
        .toString()
        .trim();
      if (!education) {
        rowErrors.push({
          column: 'Educational Qualification',
          message: 'Educational Qualification is required',
        });
      }

      // Recommended by validation
      const recommendedBy = (row['Recommended by (Organization)'] || '')
        .toString()
        .trim();
      if (!recommendedBy) {
        rowErrors.push({
          column: 'Recommended by',
          message: 'Recommended by (Organization) is required',
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
      .map((row, index) => ({ rowNumber: index + 1, ...row }))
      .filter((row) => invalidRowNumbers.has(row.rowNumber));
  }
  convertDateFormat(dateValue: any): string {
    const normalized = this.normalizeDobCell(dateValue);
    if (!normalized) return '';

    const parts = normalized.split('-').map((p) => p.trim());
    if (parts.length !== 3) return '';

    if (parts[0].length === 4) {
      const yyyy = parts[0];
      const mm = parts[1].padStart(2, '0');
      const dd = parts[2].padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    const dd = parts[0].padStart(2, '0');
    const mm = parts[1].padStart(2, '0');
    const yyyy = parts[2];
    return `${yyyy}-${mm}-${dd}`;
  }
  submitData() {
    if (!this.validateHonorificSelection()) {
      return;
    }
    if (this.errorCount === 0) {
      this.clearServerRowErrors();
      this.showValidationReport = false;
      const trainingId = this.trainingId;
      const trainingInstituteId = this.trainingInstituteId;

      // ✅ USE ALL excelData, NOT paginatedData
      console.log('Submitting all data:', this.excelData);

      const convertedData = this.excelData.map((row: any) => {
        const dobHeader = this.getDobHeaderFromRow(row);
        return ({
        name: row['Name'] || '',
        age: row['Age'] || 0,
        gender: row['Gender'] || '',
        contactNumber: row['Contact Number'] || '',
        fatherName: row["Father's Name"] || '',
        email: row['Email'] || '',
        dob: this.convertDateFormat(dobHeader ? row[dobHeader] : ''),
        category: row['Category (GN, OBC, SC, ST)'] || '',
        educationalQualification: row['Educational Qualification'] || '',
        recommendedBy: row['Recommended by (Organization)'] || '',
        photoId: row['photoId'] || null,
        trainingId: trainingId,
        trainingInstituteId: trainingInstituteId,
      })});

      this.isSpinning = true;
      this.trainingService.submitTrainees(convertedData).subscribe({
        next: (response) => {
          const parsedResponse = this.parseSubmitResponse(response);
          const hasServerErrors = this.applyServerErrorsToPreview(parsedResponse);
          this.isSpinning = false;
          if (hasServerErrors) {
            this.toastr.error('Some records have validation errors.', 'Error');
            return;
          }
          this.toastr.success(
            'Participants submitted successfully!',
            'Success',
          );
          this.router.navigate(['/admin/approvedrejectedTrainings']);
        },
        error: (error) => {
          const parsedResponse = this.parseSubmitResponse(error?.error);
          const hasServerErrors = this.applyServerErrorsToPreview(parsedResponse);
          this.isSpinning = false;
          if (hasServerErrors) {
            this.toastr.error('Some records have validation errors.', 'Error');
            return;
          }
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
    this.clearServerRowErrors();
    this.invalidRowsData = [];
    this.uploadProgress = 0;
    this.excelData = [];
    this.showFileUpload = false;
    this.prefixSet = false;
    setTimeout(() => {
      this.showFileUpload = true;
    }, 0);
  }

  downloadExcelTemplate(): void {
    // this.isSpinning = true;
    // this.trainingService.downloadExcelFile().subscribe({
    //   next: (response: Blob) => {
    //     const blob = new Blob([response], {
    //       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     });
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'TraineeTemplate.xlsx';
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //     this.toastr.success('Bulk Upload Template Downloaded', 'Success');
    //     this.isSpinning = false;
    //   },
    //   error: () => {
    //     this.toastr.error('Bulk Upload Template Not Downloaded', 'Error');
    //     this.isSpinning = false;
    //   },
    // });
    this.generateTemplate();
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
          this.trainingInstituteId,
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

  private getDobHeaderFromRow(row: any): string | null {
    const keys = Object.keys(row || {});
    return keys.find((k) => /dob|date of birth/i.test(k)) || null;
  }

  private normalizeDobCell(value: any): string {
    if (value === null || value === undefined || value === '') return '';

    const formatDateParts = (y: number, m: number, d: number): string => {
      return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${String(y)}`;
    };

    if (value instanceof Date && !isNaN(value.getTime())) {
      return formatDateParts(
        value.getFullYear(),
        value.getMonth() + 1,
        value.getDate(),
      );
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (parsed?.y && parsed?.m && parsed?.d) {
        return formatDateParts(parsed.y, parsed.m, parsed.d);
      }
      return String(value);
    }

    const text = String(value).trim();
    if (!text) return '';

    if (/^\d+(\.\d+)?$/.test(text)) {
      const parsed = XLSX.SSF.parse_date_code(Number(text));
      if (parsed?.y && parsed?.m && parsed?.d) {
        return formatDateParts(parsed.y, parsed.m, parsed.d);
      }
    }

    return text.replace(/[\/\.]/g, '-');
  }
}
