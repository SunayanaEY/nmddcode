import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface ModalField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'file' | 'select' | 'checkbox' | 'radio';
  value?: any;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: any; label: string }[];
  rows?: number; // for textarea
  accept?: string; // for file input
  min?: number; // for number input
  max?: number; // for number input
  pattern?: string; // for validation
  multiple?: boolean; // for file input or select
}

export interface ModalConfig {
  title: string;
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  showCloseButton?: boolean;
  showFooter?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  fields?: ModalField[];
  content?: string; // for custom HTML content
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule,TranslateModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() show: boolean = false;
  @Input() config: ModalConfig = { title: 'Modal' };
  @Input() data: any = {}; // for displaying read-only data
  @Input() mode: 'view' | 'edit' | 'create' = 'view';

  @Output() close = new EventEmitter<void>();
  @Output() primaryAction = new EventEmitter<any>();
  @Output() secondaryAction = new EventEmitter<any>();
  @Output() fieldChange = new EventEmitter<{ fieldId: string; value: any }>();

  formData: any = {};
  filePreviews: { [key: string]: string } = {};

  ngOnInit() {
    this.initializeFormData();
  }

  ngOnChanges() {
    if (this.show) {
      this.initializeFormData();
    }
  }

  initializeFormData() {
    this.formData = {};
    if (this.config.fields) {
      this.config.fields.forEach(field => {
        // Priority: field.value > data[field.id] > default value
        this.formData[field.id] = field.value || (this.data && this.data[field.id]) || this.getDefaultValue(field.type);
      });
    }
  }

  getDefaultValue(type: string): any {
    switch (type) {
      case 'checkbox':
        return false;
      case 'number':
        return 0;
      case 'file':
        return null;
      case 'select':
        return null;
      default:
        return '';
    }
  }

  getSizeClass(): string {
    const sizeMap = {
      'xs': 'modal-xs',
      's': 'modal-s',
      'm': 'modal-m',
      'l': 'modal-l',
      'xl': 'modal-xl'
    };
    return sizeMap[this.config.size || 'm'];
  }

  onFieldChange(fieldId: string, value: any) {
    this.formData[fieldId] = value;
    this.fieldChange.emit({ fieldId, value });
  }

  onFileChange(fieldId: string, event: any) {
    const files = event.target.files;
    const field = this.config.fields?.find(f => f.id === fieldId);

    if (field?.multiple) {
      this.onFieldChange(fieldId, files);
    } else {
      const file = files[0] || null;
      this.onFieldChange(fieldId, file);

      // Create preview for image files
      if (file && file.type.startsWith('image/')) {
        this.createFilePreview(fieldId, file);
      } else {
        this.removeFilePreview(fieldId);
      }
    }
  }

  createFilePreview(fieldId: string, file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.filePreviews[fieldId] = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  getFilePreview(fieldId: string): string | null {
    return this.filePreviews[fieldId] || null;
  }

  removeFilePreview(fieldId: string) {
    delete this.filePreviews[fieldId];
    this.formData[fieldId] = null;
    this.onFieldChange(fieldId, null);

    // Clear the file input
    const fileInput = document.getElementById(fieldId) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onClose() {
    this.close.emit();
  }

  onPrimaryAction() {
    this.primaryAction.emit(this.formData);
  }

  onSecondaryAction() {
    this.secondaryAction.emit(this.formData);
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  // Helper method to get display value for view mode
  getDisplayValue(key: string): any {
    return (this.data && this.data[key]) || '-';
  }

  // Helper method to format display values
  formatDisplayValue(value: any, type?: string): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'email':
        return value;
      case 'tel':
        return value;
      default:
        return value.toString();
    }
  }
}
