import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalConfig, ModalComponent } from '../components/modal/modal.component';
import { DashboardStats, StateData } from '../pages/public-dashboard/public-dashboard.component';
import { DashboardDataService } from '../pages/public-dashboard/services/dashboard-data.service';
import { TrainingService } from '../pages/training/services/training.service';
import { State, District, LocationService } from '../services/location.service';
import { StatsCardsComponent } from "../pages/public-dashboard/components/stats-cards/stats-cards.component";
import { MonthlyChartComponent } from "../pages/public-dashboard/components/monthly-chart/monthly-chart.component";
import { AgeGroupChartComponent } from "../pages/public-dashboard/components/age-group-chart/age-group-chart.component";
import { ModeOfTrainingChartComponent } from "../pages/public-dashboard/components/mode-of-training-chart/mode-of-training-chart.component";
import { InstituteTypeChartComponent } from "../pages/public-dashboard/components/institute-type-chart/institute-type-chart.component";
import { IndiaMapComponent } from "../pages/public-dashboard/components/india-map/india-map.component";
import { CertificateLayoutComponent } from "../pages/certificate-layout/certificate-layout.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [StatsCardsComponent, ModalComponent,
    MonthlyChartComponent, AgeGroupChartComponent,
    ModeOfTrainingChartComponent, InstituteTypeChartComponent,
    IndiaMapComponent, CertificateLayoutComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
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
    userRole: number | null = null;
    isStateAdmin: boolean = false;
    stateAdminStateId: string | null = null;

    constructor(
      private router: Router,
      private dashboardService: DashboardDataService,
      private locationService: LocationService,
      private fb: FormBuilder,
      private trainingsService: TrainingService,
      private cdr: ChangeDetectorRef
    ) {
      this.filterForm = this.fb.group({
        stateId: [''],
        districtId: ['']
      });
    }

    ngOnInit(): void {
      this.checkUserRole();
      this.loadStates();
      this.loadDashboardData();
      this.setupFilterSubscriptions();
    }

    checkUserRole(): void {
      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          this.userRole = userData.role;
          
          // Check if user is state admin (role 5)
          if (this.userRole === 5 && userData.stateId) {
            this.isStateAdmin = true;
            this.stateAdminStateId = userData.stateId;
            this.filterForm.get('stateId')?.setValue(this.stateAdminStateId);
            this.filterForm.get('stateId')?.disable();
          }
          this.cdr.detectChanges();
        } catch (error) {
          console.error('Error parsing user data from session storage:', error);
        }
      }
    }

    loadStates(): void {
      this.isLoadingStates = true;
      this.locationService.getStates().subscribe({
        next: (states) => {
          this.states = states;
          this.isLoadingStates = false;
          
          // Auto-select state for state admin
          if (this.isStateAdmin && this.stateAdminStateId) {
            this.filterForm.patchValue({ stateId: this.stateAdminStateId });
            this.selectedStateId = parseInt(this.stateAdminStateId);
          }
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
      this.filterForm.patchValue({ districtId: '' });
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
          this.filterForm.patchValue({ districtId:'' });
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
              trainingGrowth: response.data.trainingGrowth, // Keep existing growth values or calculate from API
              farmerGrowth: response.data.farmerGrowth,
              approvedGrowth: response.data.approvedGrowth,
              issuedGrowth: response.data.issuedGrowth,
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
      // stateId: [''],
      //   districtId: ['']
      //patchValue

      this.filterForm.patchValue({ stateId: '' });
      // this.filterForm.get('districtId')?.value('');
      //this.filterForm.controls['stateId'].
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
