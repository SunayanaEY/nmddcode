import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

export type CropAspectMode = 'square' | 'rectangle' | 'panoramic' | 'free';

export interface CroppedImageResult {
  blob: Blob;
  previewUrl: string;
  mimeType: string;
  aspectMode: CropAspectMode;
}

@Component({
  selector: 'app-image-cropper-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './image-cropper-modal.component.html',
  styleUrls: ['./image-cropper-modal.component.css'],
})
export class ImageCropperModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() imageFile: File | null = null;
  @Input() title = 'Crop Image';
  @Input() defaultAspectMode: CropAspectMode = 'rectangle';
  @Input() outputFormat: 'png' | 'jpeg' | 'webp' = 'png';
  @Input() resizeToWidth = 1200;

  @Output() canceled = new EventEmitter<void>();
  @Output() cropped = new EventEmitter<CroppedImageResult>();
  @Output() loadFailed = new EventEmitter<void>();

  aspectMode: CropAspectMode = 'rectangle';
  maintainAspectRatio = true;
  aspectRatio = 4 / 3;
  croppedBlob: Blob | null = null;
  croppedPreviewUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue) {
      this.aspectMode = this.defaultAspectMode;
      this.setAspectRatio(this.defaultAspectMode);
      this.croppedBlob = null;
      this.croppedPreviewUrl = null;
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  setAspect(mode: CropAspectMode): void {
    this.aspectMode = mode;
    this.setAspectRatio(mode);
  }

  onImageCropped(event: ImageCroppedEvent): void {
    this.croppedBlob = event.blob || null;
    this.croppedPreviewUrl = event.objectUrl || event.base64 || null;
  }

  onLoadFailed(): void {
    this.loadFailed.emit();
  }

  cancel(): void {
    this.canceled.emit();
  }

  apply(): void {
    if (!this.croppedBlob || !this.croppedPreviewUrl) {
      return;
    }

    this.cropped.emit({
      blob: this.croppedBlob,
      previewUrl: this.croppedPreviewUrl,
      mimeType: this.croppedBlob.type || this.getMimeType(this.outputFormat),
      aspectMode: this.aspectMode,
    });
  }

  private setAspectRatio(mode: CropAspectMode): void {
    if (mode === 'square') {
      this.maintainAspectRatio = true;
      this.aspectRatio = 1 / 1;
      return;
    }
    if (mode === 'panoramic') {
      this.maintainAspectRatio = true;
      this.aspectRatio = 21 / 9;
      return;
    }
    if (mode === 'free') {
      this.maintainAspectRatio = false;
      this.aspectRatio = 4 / 3;
      return;
    }
    this.maintainAspectRatio = true;
    this.aspectRatio = 4 / 3;
  }

  private getMimeType(format: 'png' | 'jpeg' | 'webp'): string {
    if (format === 'jpeg') {
      return 'image/jpeg';
    }
    if (format === 'webp') {
      return 'image/webp';
    }
    return 'image/png';
  }
}
