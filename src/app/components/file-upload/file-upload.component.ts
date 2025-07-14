import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @Input() acceptedFileTypes = '.png,.jpg,.jpeg';
  @Input() maxFileSizeMB = 2;
  @Input() uploadText = 'Drag and Drop the file here';
  @Input() subText = 'or';
  @Input() buttonText = 'Select file';
  @Input() showFileInfo = true;

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  isDragOver = false;
  errorMessage: string = '';

  onFileChange(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.handleFile(files[0]);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
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
    
    // Validate file type
    const allowedTypes = this.acceptedFileTypes.split(',').map(type => type.trim().toLowerCase());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      this.errorMessage = `Invalid file type. Please select a file with one of these formats: ${this.acceptedFileTypes}`;
      return;
    }
    
    // Validate file size
    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
      this.errorMessage = `File size exceeds the maximum limit of ${this.maxFileSizeMB}MB. Please select a smaller file.`;
      return;
    }
    
    // File is valid
    this.selectedFile = file;
    this.fileSelected.emit(this.selectedFile);
  }

  removeFile(): void {
    this.selectedFile = null;
    this.errorMessage = '';
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