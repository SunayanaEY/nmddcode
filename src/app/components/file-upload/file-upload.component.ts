import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css'],
})
export class FileUploadComponent implements OnChanges {
  @Input() acceptedFileTypes = '.png,.jpg,.jpeg';
  @Input() maxFileSizeMB = 2;
  @Input() uploadText = 'Drag and Drop the file here';
  @Input() subText = 'or';
  @Input() buttonText = 'Select file';
  @Input() showFileInfo = true;

  @Input() resetTrigger: boolean = false;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  @ViewChild('fileInputRef') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  isDragOver = false;
  errorMessage: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger'] && changes['resetTrigger'].currentValue) {
      this.resetFileInput();
    }
  }

  resetFileInput(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.handleFile(files[0]);
    }
    event.target.value = ''; // Allows selecting same file again
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  handleFile(file: File): void {
    this.errorMessage = '';

    const allowedTypes = this.acceptedFileTypes
      .split(',')
      .map((type) => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      this.errorMessage = `Invalid file type. Please select a file with one of these formats: ${this.acceptedFileTypes}`;
      return;
    }

    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
      this.errorMessage = `File size exceeds the maximum limit of ${this.maxFileSizeMB}MB. Please select a smaller file.`;
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(this.selectedFile);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.fileRemoved.emit();
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
