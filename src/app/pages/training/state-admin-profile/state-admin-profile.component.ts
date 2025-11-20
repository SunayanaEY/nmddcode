import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AdminService } from '../services/training-admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '../../../components/breadcrumb/breadcrumb.component';
import {
  LocationService,
  State,
  District,
} from '../../../services/location.service';
import { AuthService } from '../../../services/auth.service';
import {
  TableComponent,
  TableColumn,
  TableAction,
} from '../../../components/table/table.component';
import {
  ModalComponent,
  ModalConfig,
  ModalField,
} from '../../../components/modal/modal.component';

@Component({
  selector: 'app-state-admin-profile',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    BreadcrumbComponent,
    TableComponent,
    ModalComponent,
    TranslateModule,
  ],
  templateUrl: './state-admin-profile.component.html',
  styleUrl: './state-admin-profile.component.css',
})
export class StateAdminProfileComponent implements OnInit {
  profileForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileDoc: File | null = null;
  selectedImagePreview: string | null = null;
  selectedDocPreview: string | null = null;
  isDragOver = false;
  isDragOverDoc = false;
  showPassword = false;
  showConfirmPassword = false;
  // Password policy flags
  hasMinLength = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;
  isLoading = false;
  userRole: any;
  instituteData: any;
  trainingInstituteId: any;
  userId: any;
  error: string | null = null;
  stateAdminData: any;
  today: string | undefined;

  // Location data
  states: State[] = [];
  districts: District[] = [];
  isLoadingStates = false;
  isLoadingDistricts = false;

  // Admin types
  adminTypes = [
    { value: 'State', label: 'State Admin' },
    { value: 'Regional', label: 'Regional Admin' },
  ];

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'State Admin Profile' },
  ];

  // Table properties
  stateAdminTableData: any[] = [];
  isTableLoading = false;
  tableColumns: TableColumn[] = [
    { key: 'state', header: 'State' },
    { key: 'adminName', header: 'Contact Person Name' },
    { key: 'designation', header: 'Designation' },
    { key: 'phone', header: 'Contact Number' },
    { key: 'email', header: 'Email' },
    {
      key: 'createdAt',
      header: 'Created Date',
      transform: (value: any) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
  ];
  tableActions: TableAction[] = [
    {
      name: 'viewPrevious',
      icon: 'bi-clock-history',
      class: 'btn-info',
      title: 'See Existing State Heads',
    },
  ];

  // Modal properties
  showEditModal = false;
  editModalConfig: ModalConfig = {
    title: 'Edit State Admin',
    size: 'l',
    primaryButtonText: 'Update',
    secondaryButtonText: 'Cancel',
    fields: [
      { id: 'state', label: 'State', type: 'text', required: true },
      {
        id: 'contactPersonName',
        label: 'Contact Person Name',
        type: 'text',
        required: true,
      },
      { id: 'designation', label: 'Designation', type: 'text', required: true },
      {
        id: 'contactNumber',
        label: 'Contact Number',
        type: 'tel',
        required: true,
      },
      { id: 'email', label: 'Email', type: 'email', required: true },
    ],
  };
  selectedStateAdmin: any = {};

  // Previous State Heads Modal properties
  showPreviousStateHeadsModal = false;
  previousStateHeadsModalConfig: ModalConfig = {
    title: 'Previous State Heads',
    size: 'xl',
    primaryButtonText: 'Close',
  };
  previousStateHeadsData: any[] = [];
  previousStateHeadsTableColumns: TableColumn[] = [
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
    { key: 'stateName', header: 'State' },
  ];
  isPreviousStateHeadsLoading = false;
  previousStateHeadsError: string | null = null;

  // Custom validator for password confirmation
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private toastr: ToastrService,
    private locationService: LocationService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group(
      {
        state: ['', Validators.required],
        adminName: ['', [Validators.required, Validators.minLength(2)]],
        designation: ['', Validators.required],
        phone: [
          '',
          [
            Validators.required,
            Validators.pattern(/^[6-9]\d{9}$/),
            Validators.minLength(10),
            Validators.maxLength(10),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {
    this.getRole();
    this.loadStates();
    this.initializeForm();
    this.loadStateAdminData();
    // Subscribe to password field changes for real-time policy feedback
    this.profileForm.get('password')?.valueChanges.subscribe((password) => {
      this.validatePassword(password || '');
    });
  }

  getRole() {
    const user = this.authService.getUser();
    if (user) {
      this.userRole = user.role;
    }
  }

  // Load states from location service
  loadStates() {
    this.isLoadingStates = true;
    this.locationService.getStates().subscribe({
      next: (states) => {
        this.states = states;
        this.isLoadingStates = false;
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.isLoadingStates = false;
      },
    });
  }

  // Load districts based on selected state
  loadDistricts(stateId: number) {
    this.isLoadingDistricts = true;
    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts: District[]) => {
        this.districts = districts;
        this.isLoadingDistricts = false;
      },
      error: (error: any) => {
        console.error('Error loading districts:', error);
        this.isLoadingDistricts = false;
      },
    });
  }

  initializeForm() {
    const today = new Date();
    this.today = today.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const formData = this.profileForm.value;

      // Prepare payload according to API specification
      const payload = {
        contactPersonName: formData.adminName,
        designation: formData.designation,
        contactNumber: formData.phone,
        emailId: formData.email,
        password: formData.password,
        stateId: parseInt(formData.state),
      };

      this.isLoading = true;

      this.adminService.saveOrUpdateStateAdmin(payload).subscribe({
        next: (response) => {
          this.toastr.success(
            response.message || 'State admin profile saved successfully!'
          );
          this.profileForm.reset();
          this.isLoading = false;
          // Reload table data to show the new entry
          this.loadStateAdminData();
        },
        error: (error) => {
          console.error('API Error:', error);
          this.toastr.error(
            error.error?.message || 'Failed to save state admin profile'
          );
          this.isLoading = false;
        },
      });
    } else {
      this.toastr.error('Please fill all required fields correctly');
      this.markFormGroupTouched(this.profileForm);
    }
  }

  // File handling methods
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        this.profileForm.patchValue({ profileImage: file });
      } else {
        this.toastr.error('Please select a valid image file');
      }
    }
  }

  onFileSelectedDoc(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        this.selectedFileDoc = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedDocPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        this.profileForm.patchValue({ documents: file });
      } else {
        this.toastr.error('Please select a valid PDF or image file');
      }
    }
  }

  // Drag and drop handlers
  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  triggerFileInputImage() {
    const fileInput = document.getElementById(
      'fileInputImage'
    ) as HTMLInputElement;
    fileInput.click();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragOverDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOverDoc = true;
  }

  onDragLeave(event: DragEvent) {
    this.isDragOver = false;
  }

  onDragLeaveDoc(event: DragEvent) {
    this.isDragOverDoc = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        this.profileForm.patchValue({ profileImage: file });
      } else {
        this.toastr.error('Please select a valid image file');
      }
    }
  }

  onDropDoc(event: DragEvent) {
    event.preventDefault();
    this.isDragOverDoc = false;
    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        this.selectedFileDoc = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedDocPreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
        this.profileForm.patchValue({ documents: file });
      } else {
        this.toastr.error('Please select a valid PDF or image file');
      }
    }
  }

  removeImage(event: Event) {
    event.preventDefault();
    this.selectedFile = null;
    this.selectedImagePreview = null;
    this.profileForm.patchValue({ profileImage: null });
    const fileInput = document.getElementById(
      'fileInputImage'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removeDoc(event: Event) {
    event.preventDefault();
    this.selectedFileDoc = null;
    this.selectedDocPreview = null;
    this.profileForm.patchValue({ documents: null });
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Update password policy flags based on current password value
  validatePassword(password: string) {
    this.hasMinLength = (password || '').length >= 8;
    this.hasUppercase = /[A-Z]/.test(password || '');
    this.hasLowercase = /[a-z]/.test(password || '');
    this.hasNumber = /\d/.test(password || '');
    this.hasSpecialChar = /[@$!%*?&]/.test(password || '');
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/admin/training-module']);
  }

  // Table methods
  loadStateAdminData() {
    this.isTableLoading = true;

    this.adminService.getAllActiveStateHeads().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Map API response to table data structure
          this.stateAdminTableData = response.data.map((item) => ({
            id: item.id,
            state: item.stateName || 'N/A', // Use stateName from API or fallback
            adminName: item.contactPersonName,
            designation: item.designation,
            phone: item.contactNumber,
            email: item.emailId,
            createdAt: item.validFrom ? new Date(item.validFrom) : null,
            // Store original data for edit operations
            originalData: item,
          }));
          this.toastr.success('State admin data loaded successfully');
        } else {
          this.toastr.error(
            response.message || 'Failed to load state admin data'
          );
          this.stateAdminTableData = [];
        }
        this.isTableLoading = false;
      },
      error: (error) => {
        console.error('Error loading state admin data:', error);
        this.toastr.error('Failed to load state admin data');
        this.stateAdminTableData = [];
        this.isTableLoading = false;
      },
    });
  }

  onTableActionClick(event: { action: string; item: any; index: number }) {
    const { action, item } = event;

    switch (action) {
      case 'view':
        this.viewStateAdmin(item);
        break;
      case 'edit':
        this.editStateAdmin(item);
        break;
      case 'delete':
        this.deleteStateAdmin(item);
        break;
      case 'viewPrevious':
        this.viewPreviousStateHeads(item);
        break;
      default:
        console.log('Unknown action:', action);
    }
  }

  viewStateAdmin(item: any) {
    // TODO: Implement view functionality
    this.toastr.info(`Viewing details for ${item.adminName}`);
  }

  editStateAdmin(item: any) {
    // Map table data to modal fields using originalData from API
    const originalData = item.originalData || item;
    this.selectedStateAdmin = {
      id: originalData.id,
      state: originalData.stateName || item.state,
      contactPersonName: originalData.contactPersonName || item.adminName,
      designation: originalData.designation || item.designation,
      contactNumber: originalData.contactNumber || item.phone,
      email: originalData.emailId || item.email,
      stateId: originalData.stateId,
      userId: originalData.userId,
      // Store original API data for reference
      originalData: originalData,
    };

    this.showEditModal = true;
  }

  deleteStateAdmin(item: any) {
    if (confirm(`Are you sure you want to delete ${item.adminName}?`)) {
      // TODO: Implement delete functionality
      this.toastr.success(`${item.adminName} deleted successfully`);
      // Remove from table data
      this.stateAdminTableData = this.stateAdminTableData.filter(
        (admin) => admin.id !== item.id
      );
    }
  }

  // Modal event handlers
  onEditModalClose(): void {
    this.showEditModal = false;
    this.selectedStateAdmin = {};
  }

  onEditModalUpdate(formData: any): void {
    // Prepare payload according to API specification
    const payload = {
      contactPersonName: formData.contactPersonName,
      designation: formData.designation,
      contactNumber: formData.contactNumber,
      emailId: formData.email,
      password: formData.password || 'DefaultPassword@123', // Use existing password or default
      stateId: this.selectedStateAdmin.stateId, // Use stateId from original API data
    };

    this.adminService.saveOrUpdateStateAdmin(payload).subscribe({
      next: (response) => {
        this.toastr.success(
          response.message || 'State admin profile updated successfully'
        );
        this.loadStateAdminData(); // Reload table data from API
        this.onEditModalClose();
      },
      error: (error) => {
        console.error('Update API Error:', error);
        this.toastr.error(
          error.error?.message || 'Failed to update state admin'
        );
      },
    });
  }

  onEditModalCancel(): void {
    this.onEditModalClose();
  }

  // Previous State Heads methods
  viewPreviousStateHeads(item: any): void {
    // Extract stateId from the item (assuming it's available in the item object)
    const stateId = item.originalData.stateId; // Default to 5 as per your API example

    // Load data and show modal
    this.loadPreviousStateHeads(stateId);
  }

  loadPreviousStateHeads(stateId: number): void {
    this.isPreviousStateHeadsLoading = true;
    this.previousStateHeadsError = null; // Clear any previous errors

    this.adminService.getPreviousStateHeads(stateId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.previousStateHeadsData = response.data;
          this.previousStateHeadsError = null; // Clear error on success

          this.toastr.success('Previous state admin data loaded successfully');

          // Show modal only after successful data load
          this.showPreviousStateHeadsModal = true;

          // Add a small delay to ensure DOM updates
          setTimeout(() => {}, 100);
        } else {
          const errorMessage =
            response.message || 'Failed to load previous state heads data';
          this.previousStateHeadsError = errorMessage;
          this.toastr.error(errorMessage);
          this.previousStateHeadsData = [];
          this.showPreviousStateHeadsModal = true; // Still show modal to display error
        }

        this.isPreviousStateHeadsLoading = false;
      },
      error: (error) => {
        const errorMessage =
          'Failed to load previous state heads data. Please try again.';
        this.previousStateHeadsError = errorMessage;
        this.toastr.error(errorMessage);
        this.previousStateHeadsData = [];
        this.isPreviousStateHeadsLoading = false;
        this.showPreviousStateHeadsModal = true; // Still show modal to display error
      },
    });
  }

  onPreviousStateHeadsModalClose(): void {
    this.showPreviousStateHeadsModal = false;
    this.previousStateHeadsData = [];
  }

  onPreviousStateHeadsModalPrimaryAction(): void {
    this.onPreviousStateHeadsModalClose();
  }
}
