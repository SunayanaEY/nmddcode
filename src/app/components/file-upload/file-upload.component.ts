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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule,TranslateModule],
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

  /** ✅ Now supports multiple prepopulated files */
  @Input() filePath: string = '';

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();
  @Output() filePathRemoved = new EventEmitter<number>(); // emit index when removing a prepopulated file

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  selectedFile: File | null = null;
  isDragOver = false;
  errorMessage: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger']?.currentValue) {
      this.resetFileInput();
    }
  }

  /** Reset component completely */
  resetFileInput(): void {
    this.selectedFile = null;
    this.errorMessage = '';
    this.filePath = '';
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
  }

  /** Get display-friendly name from path */
  getFileName(path: string): string {
    return path.split(/[/\\]/).pop() || path;
  }

  /** File input change */
  onFileChange(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      this.handleFile(files[0]);
    }
    event.target.value = ''; // allow reselect
  }

  /** Drag & drop handlers */
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files?.length) {
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

  /** Validate + select file */
  handleFile(file: File): void {
    this.errorMessage = '';

    const allowedTypes = this.acceptedFileTypes
      .split(',')
      .map((type) => type.trim().toLowerCase());
    const fileExtension =
      '.' + (file.name.split('.').pop() || '').toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      if(localStorage.getItem("language")=="en")
      this.errorMessage = `Invalid file type. Allowed: ${this.acceptedFileTypes}`;

       if(localStorage.getItem("language")=="hi")
      this.errorMessage = `अमान्य फ़ाइल प्रकार. अनुमत: ${this.acceptedFileTypes}`;

      return;
    }

    if (file.size > this.maxFileSizeMB * 1024 * 1024) {
      if(localStorage.getItem("language")=="en")
      this.errorMessage = `File size exceeds ${this.maxFileSizeMB}MB.`;

      if(localStorage.getItem("language")=="en")
      this.errorMessage = `फ़ाइल का आकार अधिक है ${this.maxFileSizeMB}MB.`;
      return;
    }

    this.selectedFile = file;
    this.filePath = ''; // clear backend paths once replaced
    this.fileSelected.emit(this.selectedFile);
  }

  /** Remove file */
  removeFile(): void {
    if (this.filePath) {
      // Remove prepopulated file
      this.filePath = '';
      this.filePathRemoved.emit(0); // emit a default index or just emit void if you prefer
    } else {
      // Remove user-selected file
      this.selectedFile = null;
      this.errorMessage = '';
      if (this.fileInputRef) {
        this.fileInputRef.nativeElement.value = '';
      }
      this.fileRemoved.emit();
    }
  }

  /** Pretty-print size */
  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
