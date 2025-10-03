import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { TableComponent, TableColumn, TableAction } from '../../../components/table/table.component';
import { ModalComponent, ModalConfig, ModalField } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-state-admin-profile',
  imports: [CommonModule, ReactiveFormsModule, BreadcrumbComponent, TableComponent, ModalComponent],
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
    { label: 'State Admin Profile Data' },
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
    { key: 'createdAt', header: 'Created Date', transform: (value: any) => value ? new Date(value).toLocaleDateString() : 'N/A' }
  ];
  tableActions: TableAction[] = [
    { name: 'edit', icon: 'bi-pencil', class: 'btn-warning', title: 'Edit' },
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
      { id: 'contactPersonName', label: 'Contact Person Name', type: 'text', required: true },
       { id: 'designation', label: 'Designation', type: 'text', required: true },
       { id: 'contactNumber', label: 'Contact Number', type: 'tel', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true }
    ]
  };
  selectedStateAdmin: any = {};

  // Custom validator for password confirmation
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
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

  onSubmit() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      const formData = new FormData();

      // Append form data
      Object.keys(this.profileForm.value).forEach((key) => {
        if (key !== 'profileImage' && key !== 'documents') {
          formData.append(key, this.profileForm.value[key]);
        }
      });

      // Append files
      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }
      if (this.selectedFileDoc) {
        formData.append('documents', this.selectedFileDoc);
      }

      // Call service to create state admin profile
      this.adminService.createTrainingInstitute(formData as any).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.toastr.success('State Admin Profile created successfully!');
          this.router.navigate(['/admin/training-module']);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error creating state admin profile:', error);
          this.toastr.error(
            error.error?.message || 'Failed to create state admin profile'
          );
        },
      });
    } else {
      this.markFormGroupTouched(this.profileForm);
      this.toastr.error('Please fill all required fields correctly');
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
    const fileInput = document.getElementById('fileInputImage') as HTMLInputElement;
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
    const fileInput = document.getElementById('fileInputImage') as HTMLInputElement;
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
    // Mock data for demonstration - replace with actual API call
    setTimeout(() => {
      this.stateAdminTableData = [
        {
          id: 1,
          state: 'Uttar Pradesh',
          adminName: 'John Doe',
          designation: 'State Coordinator',
          phone: '+91-9876543210',
          email: 'john.doe@example.com',
          createdAt: new Date('2024-01-15')
        },
        {
          id: 2,
          state: 'Maharashtra',
          adminName: 'Jane Smith',
          designation: 'Regional Manager',
          phone: '+91-9876543211',
          email: 'jane.smith@example.com',
          createdAt: new Date('2024-01-20')
        },
        {
          id: 3,
          state: 'Gujarat',
          adminName: 'Mike Johnson',
          designation: 'State Admin',
          phone: '+91-9876543212',
          email: 'mike.johnson@example.com',
          createdAt: new Date('2024-02-01')
        }
      ];
      this.isTableLoading = false;
    }, 1000);
    
    // TODO: Replace with actual API call
    // this.adminService.getStateAdminList().subscribe({
    //   next: (data) => {
    //     this.stateAdminTableData = data;
    //     this.isTableLoading = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading state admin data:', error);
    //     this.toastr.error('Failed to load state admin data');
    //     this.isTableLoading = false;
    //   }
    // });
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
      default:
        console.log('Unknown action:', action);
    }
  }

  viewStateAdmin(item: any) {
    // TODO: Implement view functionality
    this.toastr.info(`Viewing details for ${item.adminName}`);
    console.log('View state admin:', item);
  }

  editStateAdmin(item: any) {
    console.log('Edit state admin:', item);
    this.selectedStateAdmin = { ...item };
    this.showEditModal = true;
  }

  deleteStateAdmin(item: any) {
    if (confirm(`Are you sure you want to delete ${item.adminName}?`)) {
      // TODO: Implement delete functionality
      this.toastr.success(`${item.adminName} deleted successfully`);
      console.log('Delete state admin:', item);
      // Remove from table data
      this.stateAdminTableData = this.stateAdminTableData.filter(admin => admin.id !== item.id);
    }
  }

  // Modal event handlers
  onEditModalClose(): void {
    this.showEditModal = false;
    this.selectedStateAdmin = {};
  }

  onEditModalUpdate(formData: any): void {
    console.log('Update state admin:', formData);
    
    // TODO: Implement API call to update state admin
    // this.adminService.updateStateAdmin(this.selectedStateAdmin.id, formData).subscribe({
    //   next: (response) => {
    //     this.toastr.success('State admin updated successfully');
    //     this.loadStateAdminData();
    //     this.onEditModalClose();
    //   },
    //   error: (error) => {
    //     this.toastr.error('Failed to update state admin');
    //   }
    // });
    
    // For now, update the local data
    const index = this.stateAdminTableData.findIndex(item => item.id === this.selectedStateAdmin.id);
    if (index !== -1) {
      this.stateAdminTableData[index] = { ...this.stateAdminTableData[index], ...formData };
      this.toastr.success('State admin updated successfully');
    }
    
    this.onEditModalClose();
  }

  onEditModalCancel(): void {
    this.onEditModalClose();
  }
}