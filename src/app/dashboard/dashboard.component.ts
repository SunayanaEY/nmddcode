import { Component, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ModalConfig,
  ModalComponent,
} from '../components/modal/modal.component';
import {
  DashboardStats,
  StateData,
} from '../pages/public-dashboard/public-dashboard.component';
import { DashboardDataService } from '../pages/public-dashboard/services/dashboard-data.service';
import { TrainingService } from '../pages/training/services/training.service';
import { State, District, LocationService } from '../services/location.service';
import { MonthlyChartComponent } from '../pages/public-dashboard/components/monthly-chart/monthly-chart.component';
import { AgeGroupChartComponent } from '../pages/public-dashboard/components/age-group-chart/age-group-chart.component';
import { InstituteTypeChartComponent } from '../pages/public-dashboard/components/institute-type-chart/institute-type-chart.component';
import { IndiaMapComponent } from '../pages/public-dashboard/components/india-map/india-map.component';
import { CommonModule } from '@angular/common';
import { NewCertificateLayoutComponent } from '../pages/new-certificate-layout/new-certificate-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardApiService, KpiData, TrainingDetailItem, TrainingInstitute } from './services/dashboard-api.service';
import { ExcelService } from '../_services/Excel/excel.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MonthlyChartComponent,
    AgeGroupChartComponent,
    InstituteTypeChartComponent,
    IndiaMapComponent,
    ReactiveFormsModule,
    CommonModule,
    NewCertificateLayoutComponent,
    TranslateModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  selectedItem: any;
  //certificate modal component properties
  
  // openModal() {
  //   this.showModal = true;
  // }

  

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
  trainingInstitutes: TrainingInstitute[] = [];
  isLoadingStates = false;
  isLoadingDistricts = false;
  isLoadingTrainingInstitutes = false;
  selectedStateId: number | null = null;
  selectedDistrictId: number | null = null;
  selectedTrainingInstituteId: string | null = null;
  userRole: number | null = null;
  isStateAdmin: boolean = false;
  stateAdminStateId: string | null = null;
  private isUpdatingFilters = false;

  // KPI Data properties
  kpiData: KpiData[] = [];
  isLoadingKpiData = false;
  kpiDataError: string | null = null;

  constructor(
    private router: Router,
    private dashboardService: DashboardDataService,
    private locationService: LocationService,
    private fb: FormBuilder,
    private trainingsService: TrainingService,
    private cdr: ChangeDetectorRef,
    private dashboardApiService: DashboardApiService,
    private excelService: ExcelService
  ) {
    this.filterForm = this.fb.group({
      stateId: [''],
      districtId: [''],
      trainingInstituteId: [''],
    });
  }

  ngOnInit(): void {
    this.checkUserRole();
    this.loadStates();
    this.loadTrainingInstitutes(); // Load all training institutes initially
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
      },
    });
  }

  loadDistricts(stateId: number): void {
    this.isLoadingDistricts = true;
    this.districts = [];
    this.isUpdatingFilters = true;
    this.filterForm.patchValue({ districtId: '' });
    this.isUpdatingFilters = false;
    this.selectedDistrictId = null;

    this.locationService.getDistrictsByState(stateId).subscribe({
      next: (districts) => {
        this.districts = districts;
        this.isLoadingDistricts = false;
      },
      error: (error) => {
        console.error('Error loading districts:', error);
        this.isLoadingDistricts = false;
      },
    });
  }

  loadTrainingInstitutes(stateId?: number): void {
    this.isLoadingTrainingInstitutes = true;
    this.trainingInstitutes = [];
    this.isUpdatingFilters = true;
    this.filterForm.patchValue({ trainingInstituteId: '' });
    this.isUpdatingFilters = false;
    this.selectedTrainingInstituteId = null;

    this.dashboardApiService.getTrainingInstitutes(stateId).subscribe({
      next: (institutes) => {
        this.trainingInstitutes = institutes;
        this.isLoadingTrainingInstitutes = false;
      },
      error: (error) => {
        console.error('Error loading training institutes:', error);
        this.isLoadingTrainingInstitutes = false;
      },
    });
  }

  setupFilterSubscriptions(): void {
    // Subscribe to state changes
    this.filterForm.get('stateId')?.valueChanges.subscribe((stateId) => {
      this.selectedStateId = stateId;
      if (stateId) {
        this.loadDistricts(stateId);
        this.loadTrainingInstitutes(stateId);
      } else {
        this.districts = [];
        this.selectedDistrictId = null;
        this.trainingInstitutes = [];
        this.selectedTrainingInstituteId = null;
        if (!this.isUpdatingFilters) {
          this.filterForm.patchValue({ 
            districtId: '',
            trainingInstituteId: ''
          });
        }
      }
      if (!this.isUpdatingFilters) {
        this.loadDashboardData();
      }
    });

    // Subscribe to district changes
    this.filterForm.get('districtId')?.valueChanges.subscribe((districtId) => {
      this.selectedDistrictId = districtId;
      if (!this.isUpdatingFilters) {
        this.loadDashboardData();
      }
    });

    // Subscribe to training institute changes
    this.filterForm.get('trainingInstituteId')?.valueChanges.subscribe((instituteId) => {
      this.selectedTrainingInstituteId = instituteId;
      if (!this.isUpdatingFilters) {
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData(): void {
    this.isLoading = true;

    this.dashboardService
      .getTrainingSummaryCount(
        this.selectedStateId || undefined,
        this.selectedDistrictId || undefined,
        this.selectedTrainingInstituteId || undefined
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dashboardStats = {
              totalTrainings: response.data.totalTrainingsConducted,
              totalFarmers: response.data.totalFarmersTrained,
              totalCertificatesApproved:
                response.data.totalCertificatesApproved,
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
    this.isUpdatingFilters = true;
    
    this.filterForm.reset();
    this.filterForm.patchValue({ 
      stateId: '',
      districtId: '',
      trainingInstituteId: ''
    });
    
    this.selectedStateId = null;
    this.selectedDistrictId = null;
    this.selectedTrainingInstituteId = null;
    this.districts = [];
    this.trainingInstitutes = [];
    this.loadTrainingInstitutes(); // Reload all training institutes
    
    this.isUpdatingFilters = false;
    this.loadDashboardData(); // Call only once after all updates
  }

  onStateSelected(stateData: StateData): void {
    this.selectedState = stateData;
    // Update charts and stats based on selected state
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignUp(): void {
    this.router.navigate(['/signup']);
  }

  

  exportData(): void {
    // TODO: Implement data export functionality
    console.log('Export data clicked');
  }

  filterByPeriod(): void {
    // TODO: Implement period filter functionality
    console.log('Filter by period clicked');
  }

  // New KPI Cards Methods
  
  /**
   * Load KPI data from API
   */
  loadKpiData(): void {
    this.isLoadingKpiData = true;
    this.kpiDataError = null;

    this.dashboardApiService.getAllKpiData().subscribe({
      next: (data) => {
        this.kpiData = data;
        this.isLoadingKpiData = false;
      },
      error: (error) => {
        console.error('Error loading KPI data:', error);
        this.kpiDataError = 'Failed to load KPI data';
        this.isLoadingKpiData = false;
      }
    });
  }

  /**
   * Get KPI cards data for dashboard display
   */
  getKpiCards() {
    return [
      {
        id: 'totalTrainingsConducted',
        title: 'Total Trainings Conducted',
        value: this.formatKpiValue(this.dashboardStats.totalTrainings),
        icon: 'fas fa-chalkboard-teacher',
        colorClass: 'kpi-card-green',
        growth: {
          value: `↑ ${this.dashboardStats.trainingGrowth}% from last Quarter`,
          isPositive: this.dashboardStats.trainingGrowth >= 0
        }
      },
      {
        id: 'totalFarmersTrained',
        title: 'Total Personnel Trained',
        value: this.formatKpiValue(this.dashboardStats.totalFarmers),
        icon: 'fas fa-users',
        colorClass: 'kpi-card-blue',
        growth: {
          value: `${this.dashboardStats.farmerGrowth >= 0 ? '↑' : '↓'} ${Math.abs(this.dashboardStats.farmerGrowth)}% from last Quarter`,
          isPositive: this.dashboardStats.farmerGrowth >= 0
        }
      },
      {
        id: 'totalCertificatesApproved',
        title: 'Total Certificates Approved',
        value: this.formatKpiValue(this.dashboardStats.totalCertificatesApproved),
        icon: 'fas fa-certificate',
        colorClass: 'kpi-card-purple',
        growth: {
          value: `${this.dashboardStats.approvedGrowth >= 0 ? '↑' : '↓'} ${Math.abs(this.dashboardStats.approvedGrowth)}% from last Quarter`,
          isPositive: this.dashboardStats.approvedGrowth >= 0
        }
      },
      {
        id: 'totalCertificatesIssued',
        title: 'Total Certificates Issued',
        value: this.formatKpiValue(this.dashboardStats.totalCertificatesIssued),
        icon: 'fas fa-award',
        colorClass: 'kpi-card-orange',
        growth: {
          value: `${this.dashboardStats.issuedGrowth >= 0 ? '↑' : '↓'} ${Math.abs(this.dashboardStats.issuedGrowth)}% from last Quarter`,
          isPositive: this.dashboardStats.issuedGrowth >= 0
        }
      }
    ];
  }

  /**
   * Format KPI values for display
   */
  formatKpiValue(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  /**
   * Handle download KPI data button click
   */
  downloadKpiData(kpiType: string, event: Event): void {
    event.preventDefault();
    
    console.log('Download KPI Data clicked:', {
      kpiType: kpiType,
      timestamp: new Date().toISOString(),
      currentFilters: {
        selectedState: this.selectedStateId,
        selectedDistrict: this.selectedDistrictId
      },
      apiParams: {
        stateId: this.selectedStateId,
        districtId: this.selectedDistrictId
      }
    });

    // Show loading state (you can add a loading indicator here)
    const button = event.target as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    button.disabled = true;

    // Fetch data and export to Excel with current filter values
    this.dashboardApiService.getTrainingDetailsByType(
      kpiType, 
      this.selectedStateId || undefined, 
      this.selectedDistrictId || undefined,
      this.selectedTrainingInstituteId || undefined
    ).subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          // Transform data for Excel export
          const excelData = response.data.map(item => ({
            'ID': item.id,
            'Name': item.name,
            'Gender': item.gender,
            'Age': item.age,
            'Contact Number': item.contactNumber,
            'Email': item.email,
            'Status': item.status,
            'UIN': item.uin,
            'Father Name': item.fatherName,
            'Date of Birth': new Date(item.dob).toLocaleDateString(),
            'Training ID': item.trainingId,
            'Upload Type': item.uploadType,
            'Created Date': new Date(item.createDate).toLocaleDateString(),
            'Updated Date': new Date(item.updateDate).toLocaleDateString(),
            'Created By': item.createdBy,
            'Training Institute ID': item.trainingInstituteId
          }));

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `${kpiType}_${timestamp}`;

          // Export to Excel
          this.excelService.exportAsExcelFile(excelData, filename);
          
          console.log(`Successfully exported ${excelData.length} records for ${kpiType}`);
        } else {
          console.warn('No data available for export');
          alert('No data available for export');
        }

        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      },
      error: (error) => {
        console.error('Error downloading KPI data:', error);
        alert('Error downloading data. Please try again.');
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
  }
}
