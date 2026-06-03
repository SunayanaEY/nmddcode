import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../../components/table/table.component';
import { TrainingService } from '../../../pages/training/services/training.service';
import { AdminService } from '../services/training-admin.service';
import {
  CroppedImageResult,
  ImageCropperModalComponent,
} from '../../../components/image-cropper-modal/image-cropper-modal.component';

interface Participant {
  name: string;
  age: number;
  gender: string;
  contactNumber: string;
  fatherName: string;
  email: string;
  dob: Date;
  category?: string;
  educationalQualification?: string;
  recommendedBy?: string;
  photoId?: number | null;
  address?: string;
}

@Component({
  selector: 'app-manual-training-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    TableComponent,
    ImageCropperModalComponent,
  ],
  templateUrl: './manual-training-upload.component.html',
  styleUrl: './manual-training-upload.component.css',
})
export class ManualTrainingUploadComponent implements OnInit {
  participantForm!: FormGroup;
  participants: Participant[] = [];
  editingIndex: number = -1;
  alphabetError: boolean = false;
  selectedPrefix: string = '';
  // aadharError: boolean = false;
  emailError: boolean = false;
  selectedParticipant: Participant | null = null;
  isSpinning: boolean = false;
  trainingDetails: any = null;
  trainingScheduleUrl: string | null = null;
  isLoadingSchedule: boolean = false;
  trainingId: any;
  trainingManagerId: any;
  trainingInstituteId: any;

  photoPreview: string | null = null;
  photoId: number | null = null;
  photoError: string = '';
  selectedFile: File | null = null;
  showImageCropper = false;
  cropperInputFile: File | null = null;
  cropperOriginalFileName = 'trainee-photo.jpg';

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/admin/role-dashboard' },
    {
      label: 'Schedule Training',
      url: '/admin/training-certificate-generation',
    },
    { label: 'Manual Training Upload' },
  ];
  tableColumns: TableColumn[] = [
    { key: 'name', header: 'Name' },
    { key: 'age', header: 'Age' },
    { key: 'gender', header: 'Gender' },
    { key: 'dob', header: 'DOB' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'fatherName', header: "Father's Name" },
    { key: 'email', header: 'Email(Optional)' },
    { key: 'address', header: 'Address' },
  ];
  tableActions: TableAction[] = [
    { name: 'edit', icon: 'bi-pencil', class: 'btn-edit', title: 'Edit' },
    { name: 'delete', icon: 'bi-trash', class: 'btn-delete', title: 'Delete' },
    // { name: 'view', icon: 'bi-eye', class: 'btn-view', title: 'View' },
  ];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private trainingService: TrainingService,
    private adminService: AdminService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Get query params from snapshot (one-time read)
    this.trainingId = this.route.snapshot.queryParams['trainingId'];
    this.getTrainingInstituteId();
    // this.getTrainingManagerId();
    // Apply delay if needed
    this.getTrainingDetails(this.trainingId);
  }
  getTrainingInstituteId() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.trainingInstituteId = user.trainingHeadId;
    }
  }
  getTrainingManagerId() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.trainingManagerId = user.trainingManagerId;
    }
  }

  // loadTrainingDetails() {
  //   this.route.queryParams.subscribe((params) => {
  //     this.trainingId = params['trainingId'];
  //   });
  //   alert(this.trainingId);
  //   this.getTrainingDetails(this.trainingId);
  // }

  initializeForm(): void {
    this.participantForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      age: [
        '',
        [
          Validators.required,
          Validators.min(1),
          Validators.max(120),
          Validators.pattern(/^[0-9]+$/),
        ],
      ],
      prefix: ['Mr', Validators.required],

      gender: ['', Validators.required],
      contactNumber: [
        '',
        [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)],
      ],
      fatherName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      category: ['', Validators.required],
      educationalQualification: ['', [Validators.maxLength(100)]],
      recommendedBy: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.email]],
      dob: ['', [Validators.required, this.dateValidator]],
      address: ['', [Validators.maxLength(200)]],
    });

    // Disable age; auto-populate from DOB
    const ageControl = this.participantForm.get('age');
    ageControl?.disable();

    const dobControl = this.participantForm.get('dob');
    dobControl?.valueChanges.subscribe((value: any) => {
      if (!value) {
        ageControl?.setValue('', { emitEvent: false });
        return;
      }
      const dobDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      const monthDiff = today.getMonth() - dobDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < dobDate.getDate())
      ) {
        age--;
      }
      if (age < 0) age = 0;
      if (age > 120) age = 120;
      ageControl?.setValue(age, { emitEvent: false });
    });
  }
  onPhotoSelect(event: any) {
    const file = event?.target?.files?.[0] || null;
    if (event?.target) {
      event.target.value = '';
    }

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.photoError = 'Please select a valid image file.';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.photoError = 'Image size should not exceed 2MB.';
        return;
      }

      this.photoError = '';
      this.cropperOriginalFileName = file.name || 'trainee-photo.jpg';
      this.cropperInputFile = file;
      this.showImageCropper = true;
    }
  }

  onPhotoCropCanceled(): void {
    this.showImageCropper = false;
    this.cropperInputFile = null;
  }

  onPhotoCropLoadFailed(): void {
    this.photoError = 'Please select a valid image file.';
    this.onPhotoCropCanceled();
  }

  onPhotoCropApplied(event: CroppedImageResult): void {
    const croppedFile = new File(
      [event.blob],
      this.createCroppedFileName(this.cropperOriginalFileName, event.mimeType),
      { type: event.mimeType },
    );

    this.selectedFile = croppedFile;
    this.photoPreview = event.previewUrl;
    this.photoError = '';
    this.showImageCropper = false;
    this.cropperInputFile = null;
    this.isSpinning = true;

    this.trainingService.uploadTraineeImage(croppedFile, 'trainee').subscribe({
      next: (response) => {
        this.isSpinning = false;
        this.toastr.success('Image uploaded successfully!', 'Success');
        this.photoId = response.data.photoId;
      },
      error: () => {
        this.isSpinning = false;
        this.toastr.error('Failed to upload trainee image. Try again !', 'Error');
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

  getTrainingDetails(trainingId: number) {
    // alert('Training Upload : ' + trainingId);
    this.isSpinning = true;
    this.trainingService.getTrainingDetails(trainingId).subscribe({
      next: (response) => {
        this.isSpinning = false;
        console.log(response);
        this.trainingDetails = response;
        this.prepareTrainingScheduleUrl();
      },
      error: (error) => {
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

  openAddModal(isEdit: boolean): void {
    if (!isEdit) {
      this.editingIndex = -1;
      this.participantForm.reset();
      this.photoPreview = null;
      this.photoId = null;
      this.selectedFile = null;
      this.photoError = '';
      this.showImageCropper = false;
      this.cropperInputFile = null;
    }

    const modalElement = document.getElementById('addParticipantModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  showPhoto(photoId: number) {
    // alert(photoId);
    this.trainingService.downloadTraineeImage(photoId).subscribe({
      next: (blob: Blob) => {
        const imageUrl = URL.createObjectURL(blob);
        this.photoPreview = imageUrl;
        // alert(this.photoPreviewUrl);
        // this.isLoadingPhoto = false;
      },
      error: (err) => {
        console.error('Failed to load photo', err);
        // this.isLoadingPhoto = false;
      },
    });
  }

  addParticipant(): void {
    if (this.participantForm.valid) {
      const formValue = this.participantForm.getRawValue();

      // Mask sensitive data for display
      this.selectedPrefix = formValue.prefix;
      const participant: Participant = {
        name: `${formValue.prefix} ${formValue.name}`.trim(),
        age: formValue.age,
        gender: formValue.gender,
        contactNumber: this.maskContactNumber(formValue.contactNumber),
        fatherName: formValue.fatherName,
        email: this.maskEmail(formValue.email),
        dob: formValue.dob,
        category: formValue.category,
        educationalQualification: formValue.educationalQualification,
        recommendedBy: formValue.recommendedBy,
        photoId: this.photoId ?? null,
        address: formValue.address,
      };

      this.participants.push(participant);
      this.photoId = null;

      this.closeModal();
      this.photoPreview = null;
      this.participantForm.reset();
      this.toastr.success('Participant added successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      this.participantForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields correctly!');
    }
  }
  //update participant
  updateParticipant(): void {
    if (this.participantForm.valid && this.editingIndex >= 0) {
      const formValue = this.participantForm.getRawValue();

      const updatedParticipant: Participant = {
        name: `${formValue.prefix} ${formValue.name}`.trim(),
        age: formValue.age,
        gender: formValue.gender,
        contactNumber: this.maskContactNumber(formValue.contactNumber),
        fatherName: formValue.fatherName,
        email: this.maskEmail(formValue.email),
        dob: formValue.dob,
        category: formValue.category,
        educationalQualification: formValue.educationalQualification,
        recommendedBy: formValue.recommendedBy,
        photoId: this.photoId ?? null,
        address: formValue.address,
      };

      this.participants[this.editingIndex] = updatedParticipant;
      this.editingIndex = -1;

      this.closeModal();
      this.photoPreview = null;
      this.participantForm.reset();
      this.toastr.success('Participant updated successfully!');
    } else {
      // Mark all fields as touched to show validation errors
      this.participantForm.markAllAsTouched();
      this.toastr.error('Please fill all required fields correctly!');
    }
  }
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      this.alphabetError = true;
      event.preventDefault();
    } else {
      this.alphabetError = false;
    }
  }
  // allowOnlyAadharDigits(event: KeyboardEvent): void {
  //   const charCode = event.which ? event.which : event.keyCode;
  //   if (charCode < 48 || charCode > 57) {
  //     this.aadharError = true;
  //     setTimeout(() => (this.aadharError = false), 1000); // Auto-hide in 1 sec
  //     event.preventDefault();
  //   }
  // }
  validateEmail(): void {
    const emailControl = this.participantForm.get('email');
    const emailValue = emailControl?.value || '';

    // Basic email format check (Angular already checks but we're adding real-time UX)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailValue && !emailRegex.test(emailValue)) {
      this.emailError = true;
    } else {
      this.emailError = false;
    }
  }

  handleTableAction(event: { action: string; item: any; index: number }): void {
    switch (event.action) {
      case 'edit':
        this.editParticipant(event.index);
        break;
      case 'delete':
        this.deleteParticipant(event.index);
        break;
      case 'view':
        this.viewParticipant(event.index);
        break;
    }
  }

  getNameOnly(fullName: string): string {
    const ALLOWED_PREFIXES = new Set(['Mr', 'Ms', 'Mrs', 'Dr', 'Prof']);
    if (!fullName) return '';
    const trimmed = fullName.trim();

    // Split only once on the first space
    const firstSpace = trimmed.indexOf(' ');
    if (firstSpace === -1) return trimmed; // no space → no prefix to remove

    const firstToken = trimmed.slice(0, firstSpace);
    const rest = trimmed.slice(firstSpace + 1).trim();

    // If the first token is a known prefix, drop it; otherwise keep the full name
    return ALLOWED_PREFIXES.has(firstToken) ? rest : trimmed;
  }

  editParticipant(index: number): void {
    this.editingIndex = index;
    const participant = this.participants[index];

    // For editing, we would need to unmask the data or store original values
    // For demo purposes, using placeholder values
    this.openAddModal(true);

    this.participantForm.patchValue({
      prefix: this.selectedPrefix,
      name: this.getNameOnly(participant.name),
      age: participant.age,
      dob: participant.dob,
      gender: participant.gender,
      contactNumber: participant.contactNumber, // Original unmasked value
      fatherName: participant.fatherName, // Original unmasked value
      category: participant.category ?? '',
      educationalQualification: participant.educationalQualification ?? '',
      recommendedBy: participant.recommendedBy ?? '',
      email:
        participant.email && participant.email.includes('xxxx')
          ? 'user@example.com'
          : participant.email,
      address: participant.address ?? '',
    });
    this.photoId = participant.photoId ?? null;
    if (this.photoId != null) {
      this.showPhoto(this.photoId);
    }
  }

  deleteParticipant(index: number): void {
    if (confirm('Are you sure you want to delete this participant?')) {
      this.participants.splice(index, 1);
    }
  }

  viewParticipant(index: number): void {
    this.selectedParticipant = this.participants[index];
    const modalElement = document.getElementById('viewParticipantModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement);
      modal.show();
    }
  }
  submitTraineesData() {
    const trainingId = this.trainingId;
    const trainingInstituteId = this.trainingInstituteId;
    const payload = this.participants.map(({ address, ...participant }) => ({
      ...participant,
      traineeAddress: address ?? '',
      trainingId: trainingId,
      trainingInstituteId: trainingInstituteId,
      photoId: participant.photoId ?? null,
    }));

    this.isSpinning = true;

    this.trainingService.submitTrainees(payload).subscribe({
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

  private closeModal(): void {
    this.photoPreview = null;
    const modalElement = document.getElementById('addParticipantModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
  }

  private maskContactNumber(contact: string): string {
    // if (contact && contact.length >= 6) {
    //   return 'xxxxxx' + contact.slice(-4);
    // }
    return contact;
  }

  // private maskAadhar(aadhar: string): string {
  //   if (aadhar && aadhar.length >= 8) {
  //     return aadhar.slice(0, 4) + 'xxxxxx' + aadhar.slice(-2);
  //   }
  //   return aadhar;
  // }

  private maskEmail(email: string): string {
    // if (email && email.includes('@')) {
    //   const [username, domain] = email.split('@');
    //   return 'xxxx@' + domain;
    // }
    return email;
  }

  // Helper method for template
  formatSerialNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }

  // Custom date validator
  dateValidator(control: any) {
    if (!control.value) {
      return null; // Let required validator handle empty values
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 120); // 120 years ago
    const adultThreshold = new Date();
    adultThreshold.setFullYear(today.getFullYear() - 18); // Minimum 18 years old

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    minDate.setHours(0, 0, 0, 0);
    adultThreshold.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { futureDate: true };
    }

    if (selectedDate > adultThreshold) {
      return { tooYoung: true };
    }

    if (selectedDate < minDate) {
      return { tooOld: true };
    }

    return null;
  }
}
