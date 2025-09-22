import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ModalComponent,
  ModalConfig,
} from '../../../components/modal/modal.component';
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

@Component({
  selector: 'app-training-centre',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    TableComponent,
    ModalComponent,
    HttpClientModule,
  ],
  templateUrl: './training-centre.component.html',
  styleUrls: ['./training-centre.component.css'],
})
export class TrainingCentreComponent implements OnInit {
  @ViewChild('editModal') editModal!: ModalComponent;

  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin/training-module' },
    { label: 'Training Institute Data' },
  ];

  showModal = false;
  selectedCentre: any = null;
  modalMode: 'view' | 'edit' = 'view';

  showConfirmModal = false;
  confirmationText = '';
  pendingToggleItem: any = null;
  statusFilter: string = '';
  userRole: any;
  modalConfig!: ModalConfig; // declare only, initialize in ngOnInit

  confirmModalConfig: ModalConfig = {
    title: 'Confirm Status Change',
    size: 'm',
    showCloseButton: true,
    showFooter: true,
    primaryButtonText: 'Confirm',
    secondaryButtonText: 'Cancel',
    content: '', // Will be dynamically set
    fields: [
      {
        id: 'confirmationText',
        label: 'Type "confirm" to proceed',
        type: 'text',
        required: true,
        placeholder: 'Type confirm here',
      },
    ],
  };

  trainingInstitutes: TrainingInstitute[] = [];
  isLoading = false;
  error: string | null = null;

  states: State[] = [];
  districts: District[] = [];
  selectedStateId: number | null = null;
  selectedImageFile: File | null = null;
  currentImageUrl: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private locationService: LocationService,
    private router: Router
  ) {}

  tableColumns: TableColumn[] = [
    { key: 'trainingInstituteName', header: 'Institute Name' },
    { key: 'state', header: 'State' },
    { key: 'district', header: 'District' },
    { key: 'contactPersonName', header: 'Contact Person' },
    { key: 'contactNumber', header: 'Contact Number' },
    {
      key: 'status',
      header: 'Status',
      transform: (value: any, item: any) =>
        item.active ? 'Active' : 'Inactive',
    },
  ];

  tableActions: TableAction[] = [
    {
      name: 'edit',
      icon: 'bi-pencil',
      class: 'btn-warning',
      title: 'Edit Details',
    },
  ];

  trainingCentres: any[] = [];

  exportHeaders = [
    'Institute Name',
    'State',
    'District',
    'Contact Person',
    'Contact Number',
    'Status',
  ];
  exportColumnKeys = [
    'trainingInstituteName',
    'state',
    'district',
    'contactPersonName',
    'contactNumber',
    'status',
  ];

  ngOnInit(): void {
    this.getRole();
    if (this.userRole === 5) {
      this.tableActions.splice(1, 0, {
        name: 'fill',
        icon: 'bi-card-text',
        class: 'btn-success',
        title: 'Complete Form',
        condition: (row: any) => row.status === 'PENDING STATE INPUT',
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
      this.modalConfig = {
        title: 'Training Institute Admin Details',
        size: 'l',
        showCloseButton: true,
        showFooter: true,
        primaryButtonText: 'Close',
        fields: [
          {
            id: 'instituteImage',
            label: 'Institute Image',
            type: 'file',
            accept: '.jpg,.jpeg,.png,.gif',
            placeholder: 'Select institute image',
          },
          {
            id: 'trainingInstituteName',
            label: 'Institute Name',
            type: 'text',
            required: true,
            placeholder: 'Enter institute name',
          },
          {
            id: 'state',
            label: 'Current State',
            type: 'text',
            disabled: true,
            placeholder: 'Current state',
          },
          {
            id: 'district',
            label: 'Current District',
            type: 'text',
            disabled: true,
            placeholder: 'Current district',
          },
          {
            id: 'newStateId',
            label: 'Change State (Optional)',
            type: 'select',
            placeholder: 'Select new state if you want to change',
            options: [],
          },
          {
            id: 'newDistrictId',
            label: 'Change District (Optional)',
            type: 'select',
            placeholder: 'Select new district if you want to change',
            options: [],
          },
          {
            id: 'contactPersonName',
            label: 'Contact Person',
            type: 'text',
            required: true,
            placeholder: 'Enter contact person name',
            disabled: this.userRole == 1,
          },
          {
            id: 'contactNumber',
            label: 'Contact Number',
            type: 'tel',
            required: true,
            placeholder: 'Enter contact number',
            pattern: '[0-9]{10}',
            disabled: this.userRole == 1,
          },
          {
            id: 'emailId',
            label: 'Email ID',
            type: 'email',
            required: true,
            placeholder: 'Enter email address',
            disabled: this.userRole == 1,
          },
          {
            id: 'designation',
            label: 'Designation',
            type: 'text',
            placeholder: 'Enter designation',
          },
          {
            id: 'registrationId',
            label: 'Registration ID',
            type: 'text',
            disabled: true,
            placeholder: 'Enter registration ID',
          },
          {
            id: 'address',
            label: 'Address',
            type: 'textarea',
            placeholder: 'Enter complete address',
          },
          {
            id: 'latitude',
            label: 'Latitude',
            type: 'number',
            placeholder: 'Enter latitude (e.g., 28.6139)',
          },
          {
            id: 'longitude',
            label: 'Longitude',
            type: 'number',
            placeholder: 'Enter longitude (e.g., 77.2090)',
          },
        ],
      };
    }

    this.loadTrainingInstitutes();
    this.loadStates();
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

  loadStates(): void {
    this.locationService.getStates().subscribe({
      next: (states) => {
        this.states = states;
        const stateField = this.modalConfig.fields?.find(
          (field) => field.id === 'newStateId'
        );
        if (stateField) {
          stateField.options = states.map((state) => ({
            value: state.id,
            label: state.stateName,
          }));
        }
      },
      error: (error) => {
        console.error('Error loading states:', error);
      },
    });
  }
  getRole() {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role;
    }
  }

  loadDistrictsByState(stateId: number): void {
    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts) => {
        this.districts = districts;
        const newDistrictField = this.modalConfig.fields?.find(
          (field) => field.id === 'newDistrictId'
        );
        if (newDistrictField) {
          newDistrictField.options = districts.map((district) => ({
            value: district.id,
            label: district.districtName,
          }));
        }
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
      0
    );
  }

  get statesCovered(): number {
    return new Set(this.trainingCentres.map((centre) => centre.state)).size;
  }

  onTableAction(event: { action: string; item: any; index: number }) {
    switch (event.action) {
      case 'view':
        this.viewTrainingCentre(event.item);
        break;
      case 'edit':
        this.editTrainingCentre(event.item);
        break;
      case 'fill':
        this.fillTrainingCentre(event.item);
        break;
      case 'toggle':
        this.toggleCentreStatus(event.item);
        break;
      case 'delete':
        this.deleteTrainingCentre(event.item);
        break;
    }
  }

  viewTrainingCentre(centre: any) {
    this.selectedCentre = { ...centre };
    this.modalMode = 'view';
    this.modalConfig.title = 'Training Institute Admin Details';
    this.modalConfig.primaryButtonText = 'Close';

    // Set current image URL if available
    if (centre.instituteImage) {
      this.currentImageUrl = centre.instituteImage;
      // Ensure the image URL is available in the data object for the modal
      this.selectedCentre.instituteImage = centre.instituteImage;
    }

    // Filter out state and district change fields for view mode
    this.modalConfig.fields = this.modalConfig.fields?.filter(
      (field) => field.id !== 'newStateId' && field.id !== 'newDistrictId'
    );

    this.showModal = true;
  }

  editTrainingCentre(centre: any) {
    this.selectedCentre = centre;
    this.modalMode = 'edit';
    this.modalConfig.title = 'Edit Training Institute Admin Details';
    this.modalConfig.primaryButtonText = 'Update';
    this.selectedImageFile = null;

    // Set current image URL if available
    if (centre.instituteImage) {
      this.currentImageUrl = centre.instituteImage;
    }

    // Ensure state and district change fields are available for edit mode
    this.restoreStateDistrictFields();

    this.showModal = true;
  }
  fillTrainingCentre(centre: any) {
    alert('Coming here !!');
    this.router.navigate(['/admin/training-centre-admin-profile'], {
      state: { data: centre },
    });
  }

  restoreStateDistrictFields() {
    // Check if state and district change fields are missing and restore them
    const hasNewStateField = this.modalConfig.fields?.some(
      (field) => field.id === 'newStateId'
    );
    const hasNewDistrictField = this.modalConfig.fields?.some(
      (field) => field.id === 'newDistrictId'
    );

    if (!hasNewStateField) {
      // Find the position after 'district' field to insert state change field
      const districtIndex = this.modalConfig.fields?.findIndex(
        (field) => field.id === 'district'
      );
      if (districtIndex !== undefined && districtIndex >= 0) {
        this.modalConfig.fields?.splice(districtIndex + 1, 0, {
          id: 'newStateId',
          label: 'Change State (Optional)',
          type: 'select',
          placeholder: 'Select new state if you want to change',
          options: [],
        });
      }
    }

    if (!hasNewDistrictField) {
      // Find the position after 'newStateId' field to insert district change field
      const newStateIndex = this.modalConfig.fields?.findIndex(
        (field) => field.id === 'newStateId'
      );
      if (newStateIndex !== undefined && newStateIndex >= 0) {
        this.modalConfig.fields?.splice(newStateIndex + 1, 0, {
          id: 'newDistrictId',
          label: 'Change District (Optional)',
          type: 'select',
          placeholder: 'Select new district if you want to change',
          options: [],
          disabled: true,
        });
      }
    }
  }

  getFieldDisabledState(fieldId: string, centre: any): boolean {
    if (this.modalMode === 'view') {
      return true;
    }

    if (
      fieldId === 'registrationId' ||
      fieldId === 'currentState' ||
      fieldId === 'currentDistrict'
    ) {
      return true;
    }

    if (fieldId === 'newDistrictId') {
      const newStateField = this.modalConfig.fields?.find(
        (field) => field.id === 'newStateId'
      );
      if (newStateField && !newStateField.value) {
        return true;
      }
    }

    return false;
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
    this.confirmModalConfig.content = `
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

  onConfirmToggle(formData: any) {
    if (formData.confirmationText?.toLowerCase() === 'confirm') {
      this.performToggle();
    } else {
      alert('Please type "confirm" to proceed with the status change.');
    }
  }

  performToggle() {
    if (!this.pendingToggleItem) return;

    this.adminService
      .toggleActiveInactive(this.pendingToggleItem.id)
      .subscribe({
        next: (response) => {
          // Update the item in the local array
          const index = this.trainingCentres.findIndex(
            (centre) => centre.id === this.pendingToggleItem.id
          );
          if (index !== -1) {
            this.trainingCentres[index].active =
              !this.trainingCentres[index].active;
          }

          // Close the confirmation modal
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
          this.showConfirmModal = false;
          this.pendingToggleItem = null;
          this.confirmationText = '';
        },
      });
  }

  onCancelToggle() {
    this.showConfirmModal = false;
    this.pendingToggleItem = null;
    this.confirmationText = '';
  }

  deleteTrainingCentre(centre: any) {
    if (confirm(`Are you sure you want to delete ${centre.centreName}?`)) {
      this.adminService.deleteTrainingInstitute(centre.id).subscribe({
        next: () => {
          this.trainingCentres = this.trainingCentres.filter(
            (c) => c.id !== centre.id
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

  closeModal() {
    this.showModal = false;
    this.selectedCentre = null;
    this.modalMode = 'view';
    this.modalConfig.title = 'Training Institute Admin Details';
    this.modalConfig.primaryButtonText = 'Close';
    this.selectedStateId = null;
    const newDistrictField = this.modalConfig.fields?.find(
      (field) => field.id === 'newDistrictId'
    );
    if (newDistrictField) {
      newDistrictField.disabled = true;
      newDistrictField.options = [];
      newDistrictField.value = null;
    }
    const newStateField = this.modalConfig.fields?.find(
      (field) => field.id === 'newStateId'
    );
    if (newStateField) {
      newStateField.value = null;
    }
    this.selectedImageFile = null;
    this.currentImageUrl = null;
  }

  onModalFieldChange(event: { fieldId: string; value: any }) {
    if (event.fieldId === 'newStateId' && event.value) {
      this.selectedStateId = event.value;
      this.loadDistrictsByState(event.value);

      // Enable and reset district field
      const newDistrictField = this.modalConfig.fields?.find(
        (field) => field.id === 'newDistrictId'
      );
      if (newDistrictField) {
        newDistrictField.disabled = false;
        newDistrictField.value = null;
      }
    } else if (
      event.fieldId === 'instituteImage' &&
      event.value instanceof File
    ) {
      this.selectedImageFile = event.value;
      // Create a preview URL for the selected image
      this.currentImageUrl = URL.createObjectURL(event.value);
    }
  }

  onModalPrimaryAction(data: any) {
    if (this.modalMode === 'edit') {
      this.updateTrainingCentre(data);
    } else {
      this.closeModal();
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
    const instituteDetails = {
      id: this.selectedCentre.id,
      username: this.selectedCentre.username || 'user1', // Add username field
      trainingInstituteName: updatedData.trainingInstituteName,
      stateId: finalStateId,
      districtId: finalDistrictId,
      block: updatedData.block || '',
      contactPersonName: updatedData.contactPersonName,
      designation: updatedData.designation || '',
      contactNumber: updatedData.contactNumber,
      emailId: updatedData.emailId,
      address: updatedData.address || '',
      latitude: updatedData.latitude || 0,
      longitude: updatedData.longitude || 0,
      password: 'Password@12', // Add password field as required
    };

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
        // Update the item in the local array
        const index = this.trainingCentres.findIndex(
          (centre) => centre.id === this.selectedCentre.id
        );
        if (index !== -1) {
          // Update with the response data or merge with existing data
          this.trainingCentres[index] = {
            ...this.trainingCentres[index],
            ...response,
          };
        }

        // Clear the file preview after successful save
        if (this.editModal) {
          this.editModal.removeFilePreview('instituteImage');
        }

        alert('Training centre updated successfully');
        this.closeModal();

        // Optionally reload the data to ensure consistency
        this.loadTrainingInstitutes();
      },
      error: (error) => {
        console.error('Error updating training centre:', error);
        alert('Failed to update training centre. Please try again.');
      },
    });
  }

  exportToExcel(): void {
    if (this.trainingCentres.length === 0) {
      alert('No data available to export');
      return;
    }

    // Prepare data for export
    const exportData = this.trainingCentres.map((centre) => {
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
