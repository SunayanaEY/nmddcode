import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { TableComponent, TableColumn, TableAction } from '../../../components/table/table.component';
import { ModalComponent, ModalConfig } from '../../../components/modal/modal.component';

@Component({
  selector: 'app-training-centre',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, TableComponent, ModalComponent],
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
  modalConfig: ModalConfig = {
    title: 'Training Centre Details',
    size: 'l',
    showCloseButton: true,
    showFooter: true,
    primaryButtonText: 'Close'
  };

  tableColumns: TableColumn[] = [
    { key: 'centreName', header: 'Centre Name' },
    { key: 'location', header: 'Location' },
    { key: 'state', header: 'State' },
    { key: 'district', header: 'District' },
    { key: 'status', header: 'Status' }
  ];

  tableActions: TableAction[] = [
    {
      name: 'view',
      icon: 'bi-eye',
      class: 'btn-info',
      title: 'View Details'
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

  trainingCentres = [
    {
      id: 1,
      centreName: 'National Dairy Development Centre - Delhi',
      location: 'New Delhi',
      state: 'Delhi',
      district: 'Central Delhi',
      contactPerson: 'Dr. Rajesh Kumar',
      contactNumber: '+91-9876543210',
      email: 'rajesh.kumar@nddb.coop',
      capacity: 15,
      status: 'Active'
    },
    {
      id: 2,
      centreName: 'Regional Training Centre - Mumbai',
      location: 'Andheri West, Mumbai',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      contactPerson: 'Ms. Priya Sharma',
      contactNumber: '+91-9876543211',
      email: 'priya.sharma@nddb.coop',
      capacity: 12,
      status: 'Active'
    },
    {
      id: 3,
      centreName: 'Dairy Technology Institute - Bangalore',
      location: 'Electronic City, Bangalore',
      state: 'Karnataka',
      district: 'Bangalore Urban',
      contactPerson: 'Dr. Suresh Reddy',
      contactNumber: '+91-9876543212',
      email: 'suresh.reddy@nddb.coop',
      capacity: 100,
      status: 'Active'
    },
    {
      id: 4,
      centreName: 'Cooperative Training Centre - Ahmedabad',
      location: 'Vastrapur, Ahmedabad',
      state: 'Gujarat',
      district: 'Ahmedabad',
      contactPerson: 'Mr. Kiran Patel',
      contactNumber: '+91-9876543213',
      email: 'kiran.patel@nddb.coop',
      capacity: 80,
      status: 'Active'
    },
    {
      id: 5,
      centreName: 'Rural Development Centre - Lucknow',
      location: 'Gomti Nagar, Lucknow',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      contactPerson: 'Dr. Anita Singh',
      contactNumber: '+91-9876543214',
      email: 'anita.singh@nddb.coop',
      capacity: 90,
      status: 'Under Maintenance'
    },
    {
      id: 6,
      centreName: 'Dairy Farmers Training Hub - Chennai',
      location: 'T. Nagar, Chennai',
      state: 'Tamil Nadu',
      district: 'Chennai',
      contactPerson: 'Mr. Venkatesh Iyer',
      contactNumber: '+91-9876543215',
      email: 'venkatesh.iyer@nddb.coop',
      capacity: 110,
      status: 'Active'
    },
    {
      id: 7,
      centreName: 'Cooperative Education Centre - Kolkata',
      location: 'Salt Lake, Kolkata',
      state: 'West Bengal',
      district: 'Kolkata',
      contactPerson: 'Ms. Ritu Banerjee',
      contactNumber: '+91-9876543216',
      email: 'ritu.banerjee@nddb.coop',
      capacity: 75,
      status: 'Active'
    },
    {
      id: 8,
      centreName: 'Dairy Processing Training Centre - Hyderabad',
      location: 'HITEC City, Hyderabad',
      state: 'Telangana',
      district: 'Hyderabad',
      contactPerson: 'Dr. Ramesh Naidu',
      contactNumber: '+91-9876543217',
      email: 'ramesh.naidu@nddb.coop',
      capacity: 95,
      status: 'Active'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  // Getter methods for template calculations
  get activeCentresCount(): number {
    return this.trainingCentres.filter(c => c.status === 'Active').length;
  }

  get totalCapacity(): number {
    return this.trainingCentres.reduce((sum, centre) => sum + centre.capacity, 0);
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
    this.showModal = true;
  }

  toggleCentreStatus(centre: any) {
    const newStatus = centre.status === 'Active' ? 'Inactive' : 'Active';
    centre.status = newStatus;
    console.log(`Training centre ${centre.centreName} status changed to ${newStatus}`);
  }

  closeModal() {
    this.showModal = false;
    this.selectedCentre = null;
  }

  deleteTrainingCentre(centre: any) {
    console.log('Deleting training centre:', centre);
    // Implement delete functionality
    if (confirm(`Are you sure you want to delete ${centre.centreName}?`)) {
      this.trainingCentres = this.trainingCentres.filter(c => c.id !== centre.id);
    }
  }
}