import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import { Router } from '@angular/router';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../../components/table/table.component';
import {
  AdminService,
  TrainingInstitute,
} from '../services/training-admin.service';
import { HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../services/auth.service';
import {
  LocationService,
  State,
  District,
} from '../../../services/location.service';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment';
import {
  CroppedImageResult,
  ImageCropperModalComponent,
} from '../../../components/image-cropper-modal/image-cropper-modal.component';

@Component({
  selector: 'app-training-centre',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // BreadcrumbComponent,
    TableComponent,
    HttpClientModule,
    TranslateModule,
    ImageCropperModalComponent,
  ],
  templateUrl: './training-centre.component.html',
  styleUrls: ['./training-centre.component.css'],
})
export class TrainingCentreComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Institute Master' },
  ];

  showEditModal = false;
  selectedCentre: any = null;
  editForm: any = {};
  isEditSaving = false;

  showConfirmModal = false;
  confirmationText = '';
  confirmModalContent = '';
  isConfirmLoading = false;
  pendingToggleItem: any = null;
  statusFilter: string = '';
  stateFilter: string = '';
  instituteTypeFilter: string = '';
  userRole: any;
  userId: any;

  trainingInstitutes: TrainingInstitute[] = [];
  isLoading = false;
  error: string | null = null;

  states: State[] = [];
  districts: District[] = [];
  selectedStateId: number | null = null;
  selectedImageFile: File | null = null;
  currentImageUrl: string | null = null;
  showImageCropper = false;
  cropperInputFile: File | null = null;
  cropperOriginalFileName = 'institute-image.jpg';
  url: string = environment.apiUrl;
  instituteTypes = [
    { value: 'Government Owned', label: 'Government Owned' },
    { value: 'Other Organizations', label: 'Other Organizations' },
  ];
  instituteGrades: string[] = ['A', 'B', 'A+'];
  organizations: any[] = [];
  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private locationService: LocationService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  tableColumns: TableColumn[] = [];
  tableColumns1: TableColumn[] = [];

  tableActions: TableAction[] = [
    {
      name: 'history',
      icon: 'bi-clock-history',
      class: 'btn-success',
      title: 'History',
    },
  ];

  trainingCentres: any[] = [];

  exportHeaders = [
    'Institute Name',
    'State',
    'District',
    'Username',
    'State Head Name',
    'State Head Contact',
    'State Head Email',
    'Contact Person',
    'Contact Number',
    'Status',
  ];
  exportColumnKeys = [
    'trainingInstituteName',
    'state',
    'district',
    'username',
    'stateHeadContactPerson',
    'stateHeadContact',
    'stateHeadEmail',
    'contactPersonName',
    'contactNumber',
    'status',
  ];

  // Previous State Heads Modal properties
  showPreviousInstituteHeadsModal = false;
  previousInstituteHeadsData: any[] = [];
  previousStateHeadsTableColumns: TableColumn[] = [
    { key: 'username', header: 'Username' },
    { key: 'contactPersonName', header: 'Contact Person Name' },
    { key: 'designation', header: 'Designation' },
    { key: 'contactNumber', header: 'Contact Number' },
    { key: 'emailId', header: 'Email' },
    {
      key: 'validFrom',
      header: 'Valid From',
      transform: (value: any) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      key: 'validTo',
      header: 'Valid To',
      transform: (value: any) =>
        value ? new Date(value).toLocaleDateString() : 'Active',
    },
  ];
  isPreviousInstituteHeadsLoading = false;
  previousInstituteHeadsError: string | null = null;

  ngOnInit(): void {
    this.getRole();
    if (this.userRole === 5 || this.userRole === 6) {
      this.tableActions.splice(1, 0, {
        name: 'fill',
        icon: 'bi-pencil',
        class: 'btn-warning',
        title: 'Complete Form',
        // condition: (row: any) => row.status === 'PENDING STATE INPUT',
      });
    }
    if (this.userRole === 1) {
      this.tableActions.splice(1, 0, {
        name: 'toggle',
        icon: 'bi-power',
        class: 'btn-toggle',
        title: 'Toggle Active/Inactive',
        condition: (row: any) =>
          row.status === 'PENDING CENTRAL APPROVAL' ||
          row.status === 'ACTIVE' ||
          row.status === 'DEACTIVE',
      });
      this.tableActions.splice(2, 0, {
        name: 'edit',
        icon: 'bi-pencil',
        class: 'btn-warning',
        title: 'Edit',
      });
    }
    if (this.userRole === 6) {
      this.loadTrainingInstitutesOrganization();
    } else {
      this.loadTrainingInstitutes();
    }
    this.loadStates();
    this.loadOrganizations();
  }

  onPreviousInstituteHeadsModalClose(): void {
    this.showPreviousInstituteHeadsModal = false;
    this.previousInstituteHeadsData = [];
  }
  onPreviousInstituteHeadsModalPrimaryAction(): void {
    this.onPreviousInstituteHeadsModalClose();
  }
  viewPreviousStateHeads(item: any): void {
    // Extract stateId from the item (assuming it's available in the item object)
    // const stateId = item.originalData.stateId; // Default to 5 as per your API example

    // Load data and show modal
    this.loadPreviousInstituteHeads(item.id);
  }
  loadPreviousInstituteHeads(instituteId: number): void {
    this.isPreviousInstituteHeadsLoading = true;
    this.previousInstituteHeadsError = null; // Clear any previous errors

    this.adminService.getPreviousInstituteHeads(instituteId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.previousInstituteHeadsData = response.data;
          this.previousInstituteHeadsError = null; // Clear error on success

          this.toastr.success('Previous state admin data loaded successfully');

          // Show modal only after successful data load
          this.showPreviousInstituteHeadsModal = true;

          // Add a small delay to ensure DOM updates
          setTimeout(() => {}, 100);
        } else {
          const errorMessage =
            response.message || 'Failed to load previous state heads data';
          this.previousInstituteHeadsError = errorMessage;
          this.toastr.error(errorMessage);
          this.previousInstituteHeadsData = [];
          this.showPreviousInstituteHeadsModal = true; // Still show modal to display error
        }

        this.isPreviousInstituteHeadsLoading = false;
      },
      error: (error) => {
        const errorMessage =
          'Failed to load previous state heads data. Please try again.';
        this.previousInstituteHeadsError = errorMessage;
        this.toastr.error(errorMessage);
        this.previousInstituteHeadsData = [];
        this.isPreviousInstituteHeadsLoading = false;
        this.showPreviousInstituteHeadsModal = true; // Still show modal to display error
      },
    });
  }

  loadTrainingInstitutes(): void {
    this.isLoading = true;
    this.error = null;

    this.adminService.getTrainingInstitutes().subscribe({
      next: (response) => {
        this.trainingCentres = response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading training institutes:', error);
        this.error = 'Failed to load training institutes';
        this.isLoading = false;
      },
    });
  }
  loadTrainingInstitutesOrganization(): void {
    this.isLoading = true;
    this.error = null;

    this.adminService.getTrainingInstitutesOrganization(this.userId).subscribe({
      next: (response) => {
        this.trainingCentres = response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading training institutes:', error);
        this.error = 'Failed to load training institutes';
        this.isLoading = false;
      },
    });
  }

  loadStates(): void {
    this.locationService.getStates().subscribe({
      next: (states) => {
        this.states = states;
      },
      error: (error) => {
        console.error('Error loading states:', error);
      },
    });
  }
  loadOrganizations(): void {
    this.adminService.getAllOrganization().subscribe({
      next: (organizations) => {
        this.organizations = organizations || [];
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.toastr.error('Failed to load organizations');
      },
    });
  }
  getRole() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role;
      this.userId = user.OrganizationId;
    }
    if (this.userRole == 1) {
      this.tableColumns = [
        { key: 'trainingInstituteName', header: 'TRAINING.INSTITUTE_NAME' },
        { key: 'state', header: 'COMMON.STATE' },
        { key: 'district', header: 'COMMON.DISTRICT' },
        { key: 'username', header: 'Username' },
        { key: 'contactPersonName', header: 'TRAINING.INSTITUTE_HEAD' },
        { key: 'contactNumber', header: 'COMMON.CONTACT_NUMBER' },
        { key: 'emailId', header: 'COMMON.CONTACT_MAIL' },
        {
          key: 'status',
          header: 'COMMON.STATUS',
          transform: (value: any, item: any) =>
            item.active ? 'Active' : 'Inactive',
        },
      ];
    } else {
      this.tableColumns = [
        { key: 'username', header: 'Username' },
        { key: 'trainingInstituteName', header: 'TRAINING.INSTITUTE_NAME' },
        { key: 'state', header: 'COMMON.STATE' },
        { key: 'district', header: 'COMMON.DISTRICT' },
        {
          key: 'stateHeadContactPerson',
          header: 'State/Organization Head Name',
          transform: (value: any, item: any) =>
            item.instituteType === 'Other Organizations'
              ? item.organizationHeadContactPerson
              : item.stateHeadContactPerson,
        },
        {
          key: 'stateHeadContact',
          header: 'State/Organization Head Contact',
          transform: (value: any, item: any) =>
            item.instituteType === 'Other Organizations'
              ? item.organizationHeadContact
              : item.stateHeadContact,
        },
        {
          key: 'stateHeadEmail',
          header: 'State/Organization Head Email',
          transform: (value: any, item: any) =>
            item.instituteType === 'Other Organizations'
              ? item.organizationHeadEmail
              : item.stateHeadEmail,
        },
        { key: 'contactPersonName', header: 'TRAINING.INSTITUTE_HEAD' },
        { key: 'contactNumber', header: 'COMMON.CONTACT_NUMBER' },
        { key: 'emailId', header: 'COMMON.CONTACT_MAIL' },
        { key: 'designation', header: 'COMMON.DESIGNATION' },
        {
          key: 'status',
          header: 'COMMON.STATUS',
          transform: (value: any, item: any) =>
            item.active ? 'Active' : 'Inactive',
        },
      ];
    }
  }

  loadDistrictsByState(stateId: number): void {
    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts) => {
        this.districts = districts;
      },
      error: (error) => {
        console.error('Error loading districts:', error);
      },
    });
  }

  get activeCentresCount(): number {
    return this.trainingCentres.filter((centre) => centre.active).length;
  }

  get totalCapacity(): number {
    return this.trainingCentres.reduce(
      (total, centre) => total + (centre.capacity || 0),
      0,
    );
  }

  get statesCovered(): number {
    return new Set(this.trainingCentres.map((centre) => centre.state)).size;
  }

  get uniqueStates(): string[] {
    return [...new Set(this.trainingCentres.map((centre) => centre.state))]
      .filter(Boolean)
      .sort();
  }

  get filteredTrainingCentres(): any[] {
    let filtered = [...this.trainingCentres];

    // Filter by state
    if (this.stateFilter) {
      filtered = filtered.filter((centre) => centre.state === this.stateFilter);
    }

    // Filter by status
    if (this.statusFilter) {
      if (this.statusFilter === 'active') {
        filtered = filtered.filter((centre) => centre.active === true);
      } else if (this.statusFilter === 'inactive') {
        filtered = filtered.filter((centre) => centre.active === false);
      }
    }

    // Filter by institute type
    if (this.instituteTypeFilter) {
      filtered = filtered.filter(
        (centre) => centre.instituteType === this.instituteTypeFilter,
      );
    }

    return filtered;
  }
  get filteredGovtTrainingCentres(): any[] {
    return this.filteredTrainingCentres.filter(
      (centre) => centre.instituteType !== 'Other Organizations',
    );
  }

  get filteredPrivateTrainingCentres(): any[] {
    return this.filteredTrainingCentres.filter(
      (centre) => centre.instituteType === 'Other Organizations',
    );
  }

  onStateFilterChange(state: string): void {
    this.stateFilter = state;
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
  }

  onInstituteTypeFilterChange(type: string): void {
    this.instituteTypeFilter = type;
  }

  clearFilters(): void {
    this.stateFilter = '';
    this.statusFilter = '';
    this.instituteTypeFilter = '';
  }

  onTableAction(event: { action: string; item: any; index: number }) {
    switch (event.action) {
      case 'edit':
        this.editTrainingCentre(event.item);
        break;
      case 'fill':
        this.fillTrainingCentre(event.item);
        break;
      case 'toggle':
        this.toggleCentreStatus(event.item);
        break;
      case 'history':
        this.viewPreviousStateHeads(event.item);
        break;
      case 'delete':
        this.deleteTrainingCentre(event.item);
        break;
    }
  }

  // editTrainingCentre(centre: any) {
  //   // Work on a shallow copy to avoid mutating table data
  //   this.selectedCentre = { ...centre };
  //   this.modalMode = 'edit';
  //   this.modalConfig.title = 'Edit Training Institute Admin Details';
  //   this.modalConfig.primaryButtonText = 'Update';
  //   this.selectedImageFile = null;

  //   // Set current image via authenticated blob URL if available
  //   if (centre.instituteImageUrl) {
  //     const fileName = centre.instituteImageUrl;
  //     this.adminService.downloadInstituteImage(fileName).subscribe({
  //       next: (blob: Blob) => {
  //         const imageUrl = URL.createObjectURL(blob);
  //         this.currentImageUrl = imageUrl;
  //         this.selectedCentre.instituteImageUrl = imageUrl;
  //         this.selectedCentre.instituteImage = imageUrl;
  //       },
  //       error: () => {
  //         const directUrl = `${this.url}api/photo/download/${fileName}`;
  //         this.currentImageUrl = directUrl;
  //         this.selectedCentre.instituteImageUrl = directUrl;
  //         this.selectedCentre.instituteImage = directUrl;
  //       },
  //     });
  //   }

  //   // Ensure state and district change fields are available for edit mode
  //   this.restoreStateDistrictFields();

  //   // }
  //   this.showModal = true;
  // }
  editTrainingCentre(centre: any) {
    this.selectedCentre = { ...centre };

    const originalStateId = Array.isArray(centre.stateId)
      ? centre.stateId[0]
      : centre.stateId;
    const originalDistrictId = Array.isArray(centre.districtId)
      ? centre.districtId[0]
      : centre.districtId;

    this.editForm = {
      trainingInstituteName: this.normalizeString(centre.trainingInstituteName),
      registrationId: this.normalizeString(centre.registrationId),
      contactPersonName: this.normalizeString(centre.contactPersonName),
      contactNumber: this.normalizeString(centre.contactNumber),
      emailId: this.normalizeString(centre.emailId),
      designation: this.normalizeString(centre.designation),
      instituteType: this.normalizeString(centre.instituteType),
      instituteGrade: this.normalizeString(centre.instituteGrade),
      organizationId:
        centre.organizationId !== undefined && centre.organizationId !== null
          ? centre.organizationId
          : null,
      expiryDate: this.formatDateInput(
        centre.expiryDate || centre.registrationValidity,
      ),
      address: this.normalizeString(centre.address),
      latitude: centre.latitude ?? null,
      longitude: centre.longitude ?? null,
      newStateId: originalStateId ?? null,
      newDistrictId: originalDistrictId ?? null,
    };

    this.selectedStateId = originalStateId ?? null;
    this.districts = [];
    this.selectedImageFile = null;
    if (this.currentImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentImageUrl);
    }
    this.currentImageUrl = null;

    if (originalStateId) {
      this.loadDistrictsByState(originalStateId);
    }

    console.log('[TrainingCentre/EditModal] open centre=', centre);
    console.log('[TrainingCentre/EditModal] init form=', this.editForm);
    console.log('[TrainingCentre/EditModal] option sets', {
      instituteTypes: this.instituteTypes.map((t) => t.value),
      instituteGrades: this.instituteGrades,
      organizationsCount: this.organizations?.length || 0,
    });
    this.logDropdownValueMatch(
      'instituteType',
      this.editForm.instituteType,
      this.instituteTypes.map((t) => t.value),
    );
    this.logDropdownValueMatch(
      'instituteGrade',
      this.editForm.instituteGrade,
      this.instituteGrades,
    );

    if (centre.instituteImageUrl) {
      const fileName = centre.instituteImageUrl;
      this.adminService.downloadInstituteImage(fileName).subscribe({
        next: (blob: Blob) => {
          const imageUrl = URL.createObjectURL(blob);
          this.currentImageUrl = imageUrl;
          this.selectedCentre.instituteImageUrl = imageUrl;
          console.log('[TrainingCentre/EditModal] image loaded as blob url');
        },
        error: (error) => {
          const directUrl = `${this.url}api/photo/download/${fileName}`;
          this.currentImageUrl = directUrl;
          this.selectedCentre.instituteImageUrl = directUrl;
          console.log(
            '[TrainingCentre/EditModal] image blob failed, fallback url',
            error,
          );
        },
      });
    }

    this.showEditModal = true;
  }

  fillTrainingCentre(centre: any) {
    this.router.navigate(['/admin/training-centre-admin-profile'], {
      state: { data: centre },
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.isEditSaving = false;
    this.selectedCentre = null;
    this.editForm = {};
    this.selectedStateId = null;
    this.districts = [];
    this.selectedImageFile = null;
    this.showImageCropper = false;
    this.cropperInputFile = null;
    if (this.currentImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentImageUrl);
    }
    this.currentImageUrl = null;
  }

  onEditBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeEditModal();
    }
  }

  onConfirmBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancelToggle();
    }
  }

  clearSelectedImage() {
    if (this.selectedImageFile && this.currentImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentImageUrl);
    }
    this.selectedImageFile = null;
    this.currentImageUrl = this.selectedCentre?.instituteImageUrl || null;
    this.showImageCropper = false;
    this.cropperInputFile = null;
  }

  onEditFieldChange(field: string, value: any) {
    this.editForm[field] = value;
    console.log('[TrainingCentre/EditModal] change', { field, value });
  }

  onEditInstituteTypeChange(value: any) {
    this.editForm.instituteType = value;
    console.log('[TrainingCentre/EditModal] instituteType change', value);
    if (this.editForm.instituteType !== 'Other Organizations') {
      this.editForm.organizationId = null;
      console.log(
        '[TrainingCentre/EditModal] cleared org fields for non-other type',
      );
    }
  }

  onEditNewStateChange(stateId: any) {
    this.editForm.newStateId = stateId;
    this.editForm.newDistrictId = null;
    console.log('[TrainingCentre/EditModal] newStateId change', stateId);
    if (stateId) {
      this.loadDistrictsByState(stateId);
    } else {
      this.districts = [];
    }
  }

  onEditInstituteImageChange(event: any) {
    const file = event?.target?.files?.[0] || null;
    if (event?.target) {
      event.target.value = '';
    }
    console.log('[TrainingCentre/EditModal] instituteImage selected', file);
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please select a valid image file', 'File Error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('File size must be less than 5MB', 'File Error');
      return;
    }
    this.cropperOriginalFileName = file.name || 'institute-image.jpg';
    this.cropperInputFile = file;
    this.showImageCropper = true;
  }

  onEditImageCropCanceled() {
    this.showImageCropper = false;
    this.cropperInputFile = null;
  }

  onEditImageCropLoadFailed() {
    this.toastr.error('Please select a valid image file', 'File Error');
    this.onEditImageCropCanceled();
  }

  onEditImageCropApplied(event: CroppedImageResult) {
    if (this.currentImageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.currentImageUrl);
    }
    this.selectedImageFile = new File(
      [event.blob],
      this.createCroppedFileName(this.cropperOriginalFileName, event.mimeType),
      { type: event.mimeType }
    );
    this.currentImageUrl = event.previewUrl;
    this.showImageCropper = false;
    this.cropperInputFile = null;
  }

  private createCroppedFileName(originalFileName: string, mimeType: string) {
    const baseName = originalFileName.replace(/\.[^/.]+$/, '') || 'institute-image';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      return `${baseName}-cropped.jpg`;
    }
    if (mimeType.includes('webp')) {
      return `${baseName}-cropped.webp`;
    }
    return `${baseName}-cropped.png`;
  }

  submitEditModal() {
    console.log('[TrainingCentre/EditModal] submit form=', this.editForm);

    if (!this.validateEditForm()) {
      return;
    }

    this.isEditSaving = true;
    this.updateTrainingCentre({ ...this.editForm });
  }
  private validateEditForm(): boolean {
    const f = this.editForm;

    if (!f.trainingInstituteName?.trim()) {
      this.toastr.error('Institute Name is required');
      return false;
    }

    if (!f.expiryDate) {
      this.toastr.error('Expiry Date is required');
      return false;
    }

    if (!f.instituteType) {
      this.toastr.error('Institute Type is required');
      return false;
    }

    if (!f.instituteGrade) {
      this.toastr.error('Institute Grade is required');
      return false;
    }

    if (!f.contactPersonName?.trim()) {
      this.toastr.error('Contact Person is required');
      return false;
    }

    if (!f.contactNumber?.trim()) {
      this.toastr.error('Contact Number is required');
      return false;
    }

    if (!f.emailId?.trim()) {
      this.toastr.error('Email is required');
      return false;
    }

    if (!f.newStateId) {
      this.toastr.error('State is required');
      return false;
    }

    if (!f.newDistrictId) {
      this.toastr.error('District is required');
      return false;
    }

    return true;
  }

  private normalizeString(value: any): string {
    if (value === undefined || value === null) return '';
    return typeof value === 'string' ? value.trim() : String(value);
  }

  private formatDateInput(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') {
      return value.includes('T') ? value.split('T')[0] : value;
    }
    return '';
  }

  private logDropdownValueMatch(field: string, value: any, options: any[]) {
    const normalized = this.normalizeString(value);
    const optionSet = new Set(options.map((o) => this.normalizeString(o)));
    const match = optionSet.has(normalized);
    if (!match && normalized) {
      console.warn('[TrainingCentre/EditModal] value not in options', {
        field,
        value: normalized,
        options,
      });
      return;
    }
    console.log('[TrainingCentre/EditModal] value match', {
      field,
      value: normalized,
      match,
    });
  }

  toggleCentreStatus(centre: any) {
    this.pendingToggleItem = centre;
    this.confirmationText = '';

    // Determine current status and action text
    const isActive =
      centre.active === true ||
      centre.active === 'true' ||
      centre.active === 'Active' ||
      centre.active === 'active';
    const actionText = isActive ? 'deactivate' : 'activate';
    const statusText = isActive ? 'Active' : 'Inactive';

    // Set the confirmation modal content
    this.confirmModalContent = `
      <div class="alert alert-warning mb-3">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Do you want to ${actionText} this training institute?</strong>
      </div>
      
      <div class="card border-0 bg-light mb-3">
        <div class="card-body p-3">
          <h6 class="card-title text-primary mb-3">
            <i class="fas fa-building me-2"></i>Institute Details
          </h6>
          
          <div class="row g-2">
            <div class="col-md-6">
              <small class="text-muted d-block">Institute Name</small>
              <strong>${centre.trainingInstituteName || 'N/A'}</strong>
            </div>
            <div class="col-md-6">
              <small class="text-muted d-block">Current Status</small>
              <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">
                <i class="fas ${
                  isActive ? 'fa-check-circle' : 'fa-times-circle'
                } me-1"></i>
                ${statusText}
              </span>
            </div>
            <div class="col-md-6">
              <small class="text-muted d-block">State</small>
              <strong>${centre.state || 'N/A'}</strong>
            </div>
            <div class="col-md-6">
              <small class="text-muted d-block">District</small>
              <strong>${centre.district || 'N/A'}</strong>
            </div>
            <div class="col-md-6">
              <small class="text-muted d-block">Contact Person</small>
              <strong>${centre.contactPersonName || 'N/A'}</strong>
            </div>
            <div class="col-md-6">
              <small class="text-muted d-block">Contact Number</small>
              <strong>${centre.contactNumber || 'N/A'}</strong>
            </div>
          </div>
        </div>
      </div>
      
      <div class="alert alert-info mb-0">
        <i class="fas fa-info-circle me-2"></i>
        This action will change the institute status to <strong>${
          isActive ? 'Inactive' : 'Active'
        }</strong>.
      </div>
    `;

    this.showConfirmModal = true;
  }

  onConfirmToggle() {
    if (this.confirmationText?.toLowerCase() === 'confirm') {
      this.performToggle();
    } else {
      alert('Please type "confirm" to proceed with the status change.');
    }
  }

  performToggle() {
    if (!this.pendingToggleItem) return;

    // Set loading state to show spinner
    this.isConfirmLoading = true;

    this.adminService
      .toggleActiveInactive(this.pendingToggleItem.id)
      .subscribe({
        next: (response) => {
          // Update the item in the local array
          const index = this.trainingCentres.findIndex(
            (centre) => centre.id === this.pendingToggleItem.id,
          );
          if (index !== -1) {
            this.trainingCentres[index].active =
              !this.trainingCentres[index].active;
          }

          // Reset loading state and close the confirmation modal
          this.isConfirmLoading = false;
          this.showConfirmModal = false;
          this.pendingToggleItem = null;
          this.confirmationText = '';

          // Show success message
          const newStatus = this.trainingCentres[index].active
            ? 'activated'
            : 'deactivated';
          alert(`Training institute has been ${newStatus} successfully.`);
        },
        error: (error) => {
          console.error('Error toggling centre status:', error);
          alert('Failed to update centre status. Please try again.');

          // Reset loading state and close the confirmation modal
          this.isConfirmLoading = false;
          this.showConfirmModal = false;
          this.pendingToggleItem = null;
          this.confirmationText = '';
        },
      });
  }

  onCancelToggle() {
    this.showConfirmModal = false;
    this.isConfirmLoading = false;
    this.pendingToggleItem = null;
    this.confirmationText = '';
  }

  deleteTrainingCentre(centre: any) {
    if (confirm(`Are you sure you want to delete ${centre.centreName}?`)) {
      this.adminService.deleteTrainingInstitute(centre.id).subscribe({
        next: () => {
          this.trainingCentres = this.trainingCentres.filter(
            (c) => c.id !== centre.id,
          );
          alert('Training centre deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting centre:', error);
          alert('Failed to delete training centre');
        },
      });
    }
  }

  updateTrainingCentre(updatedData: any) {
    const formData = new FormData();

    // Determine final state and district IDs
    // Extract single values from arrays if they exist
    const newStateId = Array.isArray(updatedData.newStateId)
      ? updatedData.newStateId[0]
      : updatedData.newStateId;
    const newDistrictId = Array.isArray(updatedData.newDistrictId)
      ? updatedData.newDistrictId[0]
      : updatedData.newDistrictId;
    const originalStateId = Array.isArray(this.selectedCentre.stateId)
      ? this.selectedCentre.stateId[0]
      : this.selectedCentre.stateId;
    const originalDistrictId = Array.isArray(this.selectedCentre.districtId)
      ? this.selectedCentre.districtId[0]
      : this.selectedCentre.districtId;

    const finalStateId = newStateId || originalStateId;
    const finalDistrictId = newDistrictId || originalDistrictId;

    let finalInstituteOwnedBy = null;
    if (updatedData.instituteType !== 'Government Owned' && updatedData.organizationId) {
      const selectedOrg = this.organizations?.find(
        (org: any) => org.id === updatedData.organizationId
      );
      finalInstituteOwnedBy = selectedOrg ? selectedOrg.organizationType : (this.selectedCentre.instituteOwnedBy || null);
    }

    const instituteDetails = {
      id: this.selectedCentre.id,
      // username: this.selectedCentre.username || 'user1', // Add username field
      trainingInstituteName: updatedData.trainingInstituteName,
      registrationId: updatedData.registrationId || null,
      expiryDate: updatedData.expiryDate || null,
      stateId: finalStateId,
      districtId: finalDistrictId,
      // block: updatedData.block || '',
      contactPersonName: updatedData.contactPersonName,
      designation: updatedData.designation || '',
      contactNumber: updatedData.contactNumber,
      emailId: updatedData.emailId,
      address: updatedData.address || '',
      latitude: updatedData.latitude ?? null,
      longitude: updatedData.longitude ?? null,
      instituteType: updatedData.instituteType || '',
      instituteGrade: updatedData.instituteGrade || '',
      instituteOwnedBy: finalInstituteOwnedBy,
      organizationId:
        updatedData.instituteType === 'Government Owned'
          ? null
          : updatedData.organizationId !== undefined &&
            updatedData.organizationId !== null
            ? updatedData.organizationId
            : null,
    };

    console.log('[TrainingCentre/EditModal] update payload stringified =', JSON.stringify(instituteDetails, null, 2));

    // Create a Blob for instituteDetails with proper content type
    const instituteDetailsBlob = new Blob([JSON.stringify(instituteDetails)], {
      type: 'application/json',
    });

    formData.append('instituteDetails', instituteDetailsBlob, 'blob');

    // Only append instituteImage if a file is selected
    if (this.selectedImageFile) {
      formData.append('instituteImage', this.selectedImageFile);
    }

    this.adminService.updateTrainingInstitute(formData).subscribe({
      next: (response) => {
        this.isEditSaving = false;
        // Update the item in the local array
        const index = this.trainingCentres.findIndex(
          (centre) => centre.id === this.selectedCentre.id,
        );
        if (index !== -1) {
          // Update with the response data or merge with existing data
          this.trainingCentres[index] = {
            ...this.trainingCentres[index],
            ...response,
          };
        }

        alert('Training centre updated successfully');
        this.closeEditModal();

        // Optionally reload the data to ensure consistency
        this.loadTrainingInstitutes();
      },
      error: (error) => {
        this.isEditSaving = false;
        console.error('Error updating training centre:', error);
        alert('Failed to update training centre. Please try again.');
      },
    });
  }

  exportToExcel(): void {
    if (this.filteredTrainingCentres.length === 0) {
      alert('No data available to export');
      return;
    }

    // Prepare data for export
    const exportData = this.filteredTrainingCentres.map((centre) => {
      const row: any = {};
      this.exportHeaders.forEach((header, index) => {
        const key = this.exportColumnKeys[index];
        if (key === 'status') {
          row[header] = centre.active ? 'Active' : 'Inactive';
        } else {
          row[header] = centre[key] || '';
        }
      });
      return row;
    });

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Training Institute Data');

    // Generate filename with current date
    const date = new Date();
    const filename = `Training_Institute_Admin_Data_${date.getFullYear()}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
  }
}
