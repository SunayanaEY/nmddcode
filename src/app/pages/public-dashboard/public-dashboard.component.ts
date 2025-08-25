import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DashboardDataService } from './services/dashboard-data.service';
import { LocationService, State, District } from '../../services/location.service';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { IndiaMapComponent } from './components/india-map/india-map.component';
import { MonthlyChartComponent } from './components/monthly-chart/monthly-chart.component';
import { AgeGroupChartComponent } from './components/age-group-chart/age-group-chart.component';
import { ModeOfTrainingChartComponent } from './components/mode-of-training-chart/mode-of-training-chart.component';
import {
  ModalComponent,
  ModalConfig,
} from '../../components/modal/modal.component';
import { CertificateLayoutComponent } from '../certificate-layout/certificate-layout.component';
import { TrainingService } from '../training/services/training.service';

export interface DashboardStats {
  totalTrainings: number;
  totalFarmers: number;
  totalCertificatesApproved: number;
  totalCertificatesIssued: number;
  trainingGrowth: number;
  farmerGrowth: number;
  approvedGrowth: number;
  issuedGrowth: number;
}

export interface StateData {
  stateId: string;
  stateName: string;
}

@Component({
  selector: 'app-public-dashboard',
  templateUrl: './public-dashboard.component.html',
  styleUrls: ['./public-dashboard.component.css'],
  imports: [CommonModule, ReactiveFormsModule, MonthlyChartComponent, IndiaMapComponent, StatsCardsComponent, AgeGroupChartComponent, ModeOfTrainingChartComponent, CertificateLayoutComponent, ModalComponent]
})
export class PublicDashboardComponent implements OnInit {
  selectedItem: any;
  //certificate modal component properties
  showModal = false;
  modalConfig: ModalConfig = {
    title: 'Certificate Download',
    showCloseButton: true,
    showFooter: true,
    primaryButtonText: 'Submit',
    secondaryButtonText: 'Close',
    fields: [
      {
        id: 'uin',
        label: 'UIN',
        type: 'text',
        placeholder: 'Enter UIN',
        required: true,
      },
      {
        id: 'gmail',
        label: 'Gmail',
        type: 'email',
        placeholder: 'Enter your Gmail',
        required: true,
      },
      {
        id: 'phone',
        label: 'Phone',
        type: 'tel',
        placeholder: 'Enter phone number',
        required: true,
      },
    ],
  };
  // openModal() {
  //   this.showModal = true;
  // }

  onClose() {
    this.showModal = false;
  }

  onSubmit(formData: any) {
    this.trainingsService
      .getCertificateDetails(formData.uin, formData.gmail, formData.phone)
      .subscribe({
        next: (res) => {
          if (res && res.data) {
            // Clone the data so we don’t overwrite directly
            const modifiedData = {
              ...res.data,
              location: `${res.data.venueBlock}, ${res.data.venueDistrict}, ${res.data.venueState}`,
              trainingDate: new Date(res.data.trainingDate).toLocaleDateString(
                'en-GB'
              ), // dd/mm/yyyy
            };

            this.selectedItem = modifiedData;

            const modalElement = document.getElementById(
              'viewCertificateModal'
            );
            if (modalElement) {
              const modal = new (window as any).bootstrap.Modal(modalElement);
              modal.show();
            }
          } else {
            console.warn('No data found in response:', res);
          }
        },
        error: (err) => {
          console.error('Error fetching trainees:', err);
        },
      });

    this.showModal = false; // close modal after submit
  }

  onSecondaryAction() {
    this.showModal = false;
  }

  dashboardStats: DashboardStats = {
    totalTrainings: 54,
    totalFarmers: 3932,
    totalCertificatesApproved: 2912,
    totalCertificatesIssued: 1640,
    trainingGrowth: 8,
    farmerGrowth: 24,
    approvedGrowth: 37,
    issuedGrowth: 26,
  };

  selectedState: StateData | null = null;
  isLoading = false;

  // Filter form and data
  filterForm: FormGroup;
  states: State[] = [];
  districts: District[] = [];
  isLoadingStates = false;
  isLoadingDistricts = false;
  selectedStateId: number | null = null;
  selectedDistrictId: number | null = null;

  constructor(
    private router: Router,
    private dashboardService: DashboardDataService,
    private locationService: LocationService,
    private fb: FormBuilder,
    private trainingsService: TrainingService
  ) {
    this.filterForm = this.fb.group({
      stateId: [null],
      districtId: [null]
    });
  }

  ngOnInit(): void {
    this.loadStates();
    this.loadDashboardData();
    this.setupFilterSubscriptions();
  }

  loadStates(): void {
    this.isLoadingStates = true;
    this.locationService.getStates().subscribe({
      next: (states) => {
        this.states = states;
        this.isLoadingStates = false;
      },
      error: (error) => {
        console.error('Error loading states:', error);
        this.isLoadingStates = false;
      }
    });
  }

  loadDistricts(stateId: number): void {
    this.isLoadingDistricts = true;
    this.districts = [];
    this.filterForm.patchValue({ districtId: null });
    this.selectedDistrictId = null;

    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts) => {
        this.districts = districts;
        this.isLoadingDistricts = false;
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        this.isLoadingDistricts = false;
      }
    });
  }

  setupFilterSubscriptions(): void {
    // Subscribe to state changes
    this.filterForm.get('stateId')?.valueChanges.subscribe(stateId => {
      this.selectedStateId = stateId;
      if (stateId) {
        this.loadDistricts(stateId);
      } else {
        this.districts = [];
        this.selectedDistrictId = null;
        this.filterForm.patchValue({ districtId: null });
      }
      this.loadDashboardData();
    });

    // Subscribe to district changes
    this.filterForm.get('districtId')?.valueChanges.subscribe(districtId => {
      this.selectedDistrictId = districtId;
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.getTrainingSummaryCount(this.selectedStateId || undefined, this.selectedDistrictId || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          this.dashboardStats = {
            totalTrainings: response.data.totalTrainingsConducted,
            totalFarmers: response.data.totalFarmersTrained,
            totalCertificatesApproved: response.data.totalCertificatesApproved,
            totalCertificatesIssued: response.data.totalCertificatesIssued,
            trainingGrowth: 8, // Keep existing growth values or calculate from API
            farmerGrowth: 24,
            approvedGrowth: 37,
            issuedGrowth: 26,
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching training summary:', error);
        this.isLoading = false;
        // Keep default values on error
      },
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.selectedStateId = null;
    this.selectedDistrictId = null;
    this.districts = [];
    this.loadDashboardData();
  }

  onStateSelected(stateData: StateData): void {
    this.selectedState = stateData;
    // Update charts and stats based on selected state
    console.log('Selected state:', stateData);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  downloadCertificate(): void {
    // TODO: Implement certificate download functionality
    this.showModal = true;
  }

  exportData(): void {
    // TODO: Implement data export functionality
    console.log('Export data clicked');
  }

  filterByPeriod(): void {
    // TODO: Implement period filter functionality
    console.log('Filter by period clicked');
  }
}
