import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableComponent, TableColumn, TableAction } from '../../../components/table/table.component';
import { ModalComponent, ModalConfig } from '../../../components/modal/modal.component';
import { AdminService, TrainingInstitute } from '../services/training-admin.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-training-centre',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, TableComponent, ModalComponent, HttpClientModule],
  templateUrl: './training-centre.component.html',
  styleUrls: ['./training-centre.component.css']
})
export class TrainingCentreComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/dashboard/training-module' },
    { label: 'Training Centre Data' }
  ];

  // Modal properties
  showModal = false;
  selectedCentre: any = null;
  modalMode: 'view' | 'edit' = 'view';
  modalConfig: ModalConfig = {
    title: 'Training Centre Details',
    size: 'l',
    showCloseButton: true,
    showFooter: true,
    primaryButtonText: 'Close',
    fields: [
      {
        id: 'trainingInstituteName',
        label: 'Institute Name',
        type: 'text',
        required: true,
        placeholder: 'Enter institute name'
      },
      {
        id: 'scheme',
        label: 'Scheme',
        type: 'text',
        required: true,
        placeholder: 'Enter scheme name'
      },
      {
        id: 'state',
        label: 'State',
        type: 'text',
        required: true,
        placeholder: 'Enter state'
      },
      {
        id: 'district',
        label: 'District',
        type: 'text',
        required: true,
        placeholder: 'Enter district'
      },
      {
        id: 'block',
        label: 'Block',
        type: 'text',
        required: true,
        placeholder: 'Enter block'
      },
      {
        id: 'contactPersonName',
        label: 'Contact Person',
        type: 'text',
        required: true,
        placeholder: 'Enter contact person name'
      },
      {
        id: 'contactNumber',
        label: 'Contact Number',
        type: 'tel',
        required: true,
        placeholder: 'Enter contact number',
        pattern: '[0-9]{10}'
      },
      {
        id: 'emailId',
        label: 'Email ID',
        type: 'email',
        required: true,
        placeholder: 'Enter email address'
      },
      {
        id: 'designation',
        label: 'Designation',
        type: 'text',
        placeholder: 'Enter designation'
      },
      {
        id: 'registrationId',
        label: 'Registration ID',
        type: 'text',
        placeholder: 'Enter registration ID'
      }
    ]
  };

  // API data
  trainingInstitutes: TrainingInstitute[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  tableColumns: TableColumn[] = [
    { key: 'trainingInstituteName', header: 'Institute Name' },
    { key: 'scheme', header: 'Scheme' },
    { key: 'state', header: 'State' },
    { key: 'district', header: 'District' },
    { key: 'block', header: 'Block' },
    { key: 'contactPersonName', header: 'Contact Person' },
    { key: 'contactNumber', header: 'Contact Number' }
  ];

  tableActions: TableAction[] = [
    {
      name: 'view',
      icon: 'bi-eye',
      class: 'btn-info',
      title: 'View Details'
    },
    {
      name: 'edit',
      icon: 'bi-pencil',
      class: 'btn-warning',
      title: 'Edit Details'
    },
    {
      name: 'toggle',
      icon: 'bi-toggle-on',
      class: 'btn-success',
      title: 'Toggle Active/Inactive'
    },
    {
      name: 'delete',
      icon: 'bi-trash',
      class: 'btn-danger',
      title: 'Delete'
    }
  ];

  // This will be populated from API
  trainingCentres: any[] = [];

  ngOnInit(): void {
    this.loadTrainingInstitutes();
  }

  loadTrainingInstitutes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.adminService.getTrainingInstitutes().subscribe({
      next: (data: TrainingInstitute[]) => {
        this.trainingInstitutes = data;
        // Map API data to table format
        this.trainingCentres = data.map(institute => ({
          ...institute,
          centreName: institute.trainingInstituteName,
          contactPerson: institute.contactPersonName,
          email: institute.emailId,
          status: 'Active' // Default status since API doesn't provide it
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading training institutes:', error);
        this.error = 'Failed to load training institutes. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Getter methods for template calculations
  get activeCentresCount(): number {
    return this.trainingCentres.filter(c => c.status === 'Active').length;
  }

  get totalCapacity(): number {
    // Since API doesn't provide capacity, return total institutes
    return this.trainingCentres.length;
  }

  get statesCovered(): number {
    return [...new Set(this.trainingCentres.map(c => c.district))].length;
  }

  onTableAction(event: { action: string; item: any; index: number }) {
    console.log('Table action:', event.action, 'Item:', event.item, 'Index:', event.index);
    
    switch (event.action) {
      case 'view':
        this.viewTrainingCentre(event.item);
        break;
      case 'edit':
        this.editTrainingCentre(event.item);
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
    this.selectedCentre = centre;
    this.modalMode = 'view';
    this.modalConfig.title = 'Training Centre Details';
    this.modalConfig.primaryButtonText = 'Close';
    this.showModal = true;
  }

  editTrainingCentre(centre: any) {
    this.selectedCentre = { ...centre }; // Create a copy for editing
    this.modalMode = 'edit';
    this.modalConfig.title = 'Edit Training Centre';
    this.modalConfig.primaryButtonText = 'Update';
    
    // Populate modal fields with existing data
    this.modalConfig.fields = this.modalConfig.fields?.map(field => ({
      ...field,
      value: this.getFieldValue(centre, field.id)
    })) || [];
    
    this.showModal = true;
  }

  toggleCentreStatus(centre: any) {
    // Call API to toggle status if available
    this.adminService.toggleInstituteStatus(centre.id).subscribe({
      next: (updatedInstitute) => {
        const newStatus = centre.status === 'Active' ? 'Inactive' : 'Active';
        centre.status = newStatus;
        console.log(`Training centre ${centre.centreName} status changed to ${newStatus}`);
      },
      error: (error) => {
        console.error('Error toggling institute status:', error);
        // Fallback to local toggle if API fails
        const newStatus = centre.status === 'Active' ? 'Inactive' : 'Active';
        centre.status = newStatus;
      }
    });
  }

  deleteTrainingCentre(centre: any) {
    if (confirm(`Are you sure you want to delete ${centre.centreName}?`)) {
      this.adminService.deleteTrainingInstitute(centre.id).subscribe({
        next: () => {
          this.trainingCentres = this.trainingCentres.filter(c => c.id !== centre.id);
          console.log(`Training centre ${centre.centreName} deleted successfully`);
        },
        error: (error) => {
          console.error('Error deleting institute:', error);
          alert('Failed to delete training centre. Please try again.');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedCentre = null;
    this.modalMode = 'view';
  }

  // Helper method to get field value from centre data
  getFieldValue(centre: any, fieldId: string): any {
    const fieldMapping: { [key: string]: string } = {
      'trainingInstituteName': 'trainingInstituteName',
      'scheme': 'scheme',
      'state': 'state',
      'district': 'district',
      'block': 'block',
      'contactPersonName': 'contactPersonName',
      'contactNumber': 'contactNumber',
      'emailId': 'emailId',
      'designation': 'designation',
      'registrationId': 'registrationId'
    };
    
    const mappedField = fieldMapping[fieldId] || fieldId;
    return centre[mappedField] || '';
  }

  onModalPrimaryAction(data: any) {
    if (this.modalMode === 'edit') {
      this.updateTrainingCentre(data);
    } else {
      this.closeModal();
    }
  }

  updateTrainingCentre(updatedData: any) {
    if (!updatedData || !updatedData.id) {
      console.error('Invalid data for update');
      return;
    }

    this.adminService.updateTrainingInstitute(updatedData.id, updatedData).subscribe({
      next: (response) => {
        // Update the local data
        const index = this.trainingCentres.findIndex(c => c.id === updatedData.id);
        if (index !== -1) {
          this.trainingCentres[index] = {
            ...updatedData,
            centreName: updatedData.trainingInstituteName,
            contactPerson: updatedData.contactPersonName,
            email: updatedData.emailId
          };
        }
        
        // Also update the trainingInstitutes array
        const instituteIndex = this.trainingInstitutes.findIndex(i => i.id === updatedData.id);
        if (instituteIndex !== -1) {
          this.trainingInstitutes[instituteIndex] = updatedData;
        }
        
        console.log('Training centre updated successfully');
        this.closeModal();
      },
      error: (error) => {
        console.error('Error updating training centre:', error);
        alert('Failed to update training centre. Please try again.');
      }
    });
  }
}