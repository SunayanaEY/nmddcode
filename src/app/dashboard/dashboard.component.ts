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
import { TopTrainingTypesChartComponent } from '../pages/public-dashboard/components/top-training-types-chart/top-training-types-chart.component';
import { CommonModule } from '@angular/common';
import { NewCertificateLayoutComponent } from '../pages/new-certificate-layout/new-certificate-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  DashboardApiService,
  // KpiData,
  // TrainingDetailItem,
  TrainingInstitute,
} from './services/dashboard-api.service';
import { ExcelService } from '../_services/Excel/excel.service';
import { AdminService } from '../pages/training/services/training-admin.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    MonthlyChartComponent,
    AgeGroupChartComponent,
    InstituteTypeChartComponent,
    IndiaMapComponent,
    TopTrainingTypesChartComponent,
    ReactiveFormsModule,
    CommonModule,
    NewCertificateLayoutComponent,
    TranslateModule,
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
    totalTrainings: 0,
    totalFarmers: 0,
    totalCertificatesApproved: 0,
    totalCertificatesIssued: 0,
    trainingGrowth: 0,
    totalInstitute: 0,
    farmerGrowth: 0,
    approvedGrowth: 0,
    issuedGrowth: 0,
    instituteGrowth: 0,
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
  organizationId: number | null = null;
  isStateAdmin: boolean = false;
  stateAdminStateId: string | null = null;
  private isUpdatingFilters = false;

  // KPI Data properties
  kpiData: any[] = [];
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
    private excelService: ExcelService,
    private adminService: AdminService
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
    debugger;
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
        if (this.userRole === 6 && userData.OrganizationId) {
          this.organizationId = userData.OrganizationId;
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
          const selected = this.states.find(
            (s) => s.id === this.selectedStateId
          );
          this.selectedState = selected
            ? { stateId: String(selected.id), stateName: selected.stateName }
            : null;
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

    this.dashboardApiService.getTrainingInstitutes(stateId, this.organizationId || undefined).subscribe({
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
      // Map numeric stateId from dropdown to StateData for the map
      const selected = this.states.find((s) => s.id === Number(stateId));
      this.selectedState = selected
        ? { stateId: String(selected.id), stateName: selected.stateName }
        : null;
      if (stateId) {
        this.loadDistricts(stateId);
        this.loadTrainingInstitutes(stateId);
      } else {
        this.districts = [];
        this.selectedDistrictId = null;
        this.trainingInstitutes = [];
        this.selectedTrainingInstituteId = null;
        this.selectedState = null;
        if (!this.isUpdatingFilters) {
          this.filterForm.patchValue({
            districtId: '',
            trainingInstituteId: '',
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
    this.filterForm
      .get('trainingInstituteId')
      ?.valueChanges.subscribe((instituteId) => {
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
        this.selectedTrainingInstituteId || undefined,
        this.organizationId || undefined
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
              totalInstitute: response.data.totalInstitute,
              instituteGrowth: response.data?.instituteGrowth,
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

    if (this.userRole === 5) {
      // For State Admin (role 5): Only reset District and Training Institutes fields
      this.filterForm.patchValue({
        districtId: '',
        trainingInstituteId: '',
      });

      this.selectedDistrictId = null;
      this.selectedTrainingInstituteId = null;
      this.trainingInstitutes = []; // Clear training institutes

      // Reload training institutes for the selected state (if any)
      if (this.selectedStateId) {
        this.loadTrainingInstitutes(this.selectedStateId);
      }
    } else if (this.userRole === 1) {
      // For Centre Admin (role 1): Clear all field values
      this.filterForm.reset();
      this.filterForm.patchValue({
        stateId: '',
        districtId: '',
        trainingInstituteId: '',
      });

      this.selectedStateId = null;
      this.selectedDistrictId = null;
      this.selectedTrainingInstituteId = null;
      this.districts = [];
      this.trainingInstitutes = [];
      this.loadTrainingInstitutes(); // Reload all training institutes
    } else {
      // For other roles: Use existing functionality
      this.filterForm.reset();
      this.filterForm.patchValue({
        stateId: '',
        districtId: '',
        trainingInstituteId: '',
      });

      this.selectedStateId = null;
      this.selectedDistrictId = null;
      this.selectedTrainingInstituteId = null;
      this.districts = [];
      this.trainingInstitutes = [];
      this.loadTrainingInstitutes(); // Reload all training institutes
    }

    this.isUpdatingFilters = false;
    this.loadDashboardData(); // Call only once after all updates
  }

  onStateSelected(stateData: StateData | null): void {
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

    this.dashboardApiService
      .getAllKpiData(
        this.selectedStateId || undefined,
        this.selectedDistrictId || undefined,
        this.selectedTrainingInstituteId || undefined,
        this.organizationId || undefined
      )
      .subscribe({
        next: (data) => {
          this.kpiData = data;
          this.isLoadingKpiData = false;
        },
        error: (error) => {
          console.error('Error loading KPI data:', error);
          this.kpiDataError = 'Failed to load KPI data';
          this.isLoadingKpiData = false;
        },
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
          isPositive: this.dashboardStats.trainingGrowth >= 0,
        },
      },
      {
        id: 'totalFarmersTrained',
        title: 'Total Personnel Trained',
        value: this.formatKpiValue(this.dashboardStats.totalFarmers),
        icon: 'fas fa-users',
        colorClass: 'kpi-card-blue',
        growth: {
          value: `${
            this.dashboardStats.farmerGrowth >= 0 ? '↑' : '↓'
          } ${Math.abs(this.dashboardStats.farmerGrowth)}% from last Quarter`,
          isPositive: this.dashboardStats.farmerGrowth >= 0,
        },
      },
      {
        id: 'totalCertificatesApproved',
        title: 'Total Certificates Approved',
        value: this.formatKpiValue(
          this.dashboardStats.totalCertificatesApproved
        ),
        icon: 'fas fa-certificate',
        colorClass: 'kpi-card-purple',
        growth: {
          value: `${
            this.dashboardStats.approvedGrowth >= 0 ? '↑' : '↓'
          } ${Math.abs(this.dashboardStats.approvedGrowth)}% from last Quarter`,
          isPositive: this.dashboardStats.approvedGrowth >= 0,
        },
      },
      {
        id: 'totalCertificatesIssued',
        title: 'Total Certificates Issued',
        value: this.formatKpiValue(this.dashboardStats.totalCertificatesIssued),
        icon: 'fas fa-award',
        colorClass: 'kpi-card-orange',
        growth: {
          value: `${
            this.dashboardStats.issuedGrowth >= 0 ? '↑' : '↓'
          } ${Math.abs(this.dashboardStats.issuedGrowth)}% from last Quarter`,
          isPositive: this.dashboardStats.issuedGrowth >= 0,
        },
      },
      {
        id: 'totalInstitute',
        title: 'Total Institutes',
        value: this.formatKpiValue(this.dashboardStats.totalInstitute),
        icon: 'fas fa-university',
        colorClass: 'kpi-card-green',
        growth: {
          value: `↑ ${this.dashboardStats.instituteGrowth}% from last Quarter`,
          isPositive: this.dashboardStats.instituteGrowth >= 0,
        },
      },
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
  formatDate(dateString: any): string {
    if (!dateString) return '';

    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  downloadKpiData(kpiType: string, event: Event): void {
    event.preventDefault();

    console.log('Download KPI Data clicked:', {
      kpiType: kpiType,
      timestamp: new Date().toISOString(),
      currentFilters: {
        selectedState: this.selectedStateId,
        selectedDistrict: this.selectedDistrictId,
      },
      apiParams: {
        stateId: this.selectedStateId,
        districtId: this.selectedDistrictId,
      },
    });
    // Show loading state (you can add a loading indicator here)
    const button = event.target as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    button.disabled = true;

    // Fetch data and export to Excel with current filter values
    if (kpiType == 'totalInstituteDetails') {
      let instituteObservable;
      if (this.organizationId) {
        instituteObservable = this.adminService.getTrainingInstitutesOrganization(
          this.organizationId
        );
      } else {
        instituteObservable = this.adminService.getTrainingInstitutes();
      }

      instituteObservable.subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data || [];
          if (data.length > 0) {
            // Transform data for Excel export
            const excelData = data.map((item: any, index: number) => ({
              'S.No.': index + 1,
              State: item.state,
              District: item.district,
              Address: item.address,
              'Institute Name': item.trainingInstituteName,
              'Institute Type': item.instituteType,
              'Registration No.': item.registrationId,
              'Institute Id': item.id,
              'Registration Validity': this.formatDate(item.expiryDate),
              Status: item.status,
            }));

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `${kpiType}_${timestamp}`;

            // Export to Excel
            this.excelService.exportAsExcelFile(excelData, filename);

            console.log(
              `Successfully exported ${excelData.length} records for ${kpiType}`
            );
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
        },
      });
    } else if (kpiType == 'totalTrainingsConducted') {
      this.dashboardApiService
        .getTrainingDetailsByType(
          kpiType,
          this.selectedStateId || undefined,
          this.selectedDistrictId || undefined,
          this.selectedTrainingInstituteId || undefined,
          this.organizationId || undefined
        )
        .subscribe({
          next: (response) => {
            if (response.success && response.data.length > 0) {
              // Transform data for Excel export
              const excelData = response.data.map((item, index) => ({
                'Sl. No.': index + 1,
                State: item.venueState,
                District: item.venueDistrict,
                'Institute Name': item.trainingInstituteName,
                'Name of the Training': item.trainingTitle,
                'Training ID': item.trainingId,
                Scheme: item.scheme,
                'Trainer Name': item.trainerName,
                'No of Trainees': item.numberOfTrainees,
                'From Date': this.formatDate(item.fromDate),
                'To Date': this.formatDate(item.toDate),
                Duration: item.duration,
                'Mode of Training': item.modeOfTraining,
              }));

              // Generate filename with timestamp
              const timestamp = new Date().toISOString().split('T')[0];
              const filename = `${kpiType}_${timestamp}`;

              // Export to Excel
              this.excelService.exportAsExcelFile(excelData, filename);

              console.log(
                `Successfully exported ${excelData.length} records for ${kpiType}`
              );
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
          },
        });
    } else if (kpiType == 'totalFarmersTrained') {
      this.dashboardApiService
        .getTrainingDetailsByType(
          kpiType,
          this.selectedStateId || undefined,
          this.selectedDistrictId || undefined,
          this.selectedTrainingInstituteId || undefined,
          this.organizationId || undefined
        )
        .subscribe({
          next: (response) => {
            if (response.success && response.data.length > 0) {
              // Transform data for Excel export
              const excelData = response.data.map((item, index) => ({
                'Training ID': item.trainingId,
                'Training Institute ID': item.trainingInstituteId,
                'Trainees ID': item.id,
                Name: item.name,
                Gender: item.gender,
                Age: item.age,
                'Contact Number': item.contactNumber,
                Email: item.email,
                UIN: item.uin,
                'Father Name': item.fatherName,
                'Date of Birth': this.formatDate(item.dob),
                'Upload Type': item.uploadType,
                'Created Date': this.formatDate(item.createDate),
                'Approval Date': this.formatDate(item.approvedDate),
                'Approved by ': item.approvedBy,
                Status: item.status,
              }));

              // Generate filename with timestamp
              const timestamp = new Date().toISOString().split('T')[0];
              const filename = `${kpiType}_${timestamp}`;

              // Export to Excel
              this.excelService.exportAsExcelFile(excelData, filename);

              console.log(
                `Successfully exported ${excelData.length} records for ${kpiType}`
              );
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
          },
        });
    } else {
      this.dashboardApiService
        .getTrainingDetailsByType(
          kpiType,
          this.selectedStateId || undefined,
          this.selectedDistrictId || undefined,
          this.selectedTrainingInstituteId || undefined,
          this.organizationId || undefined
        )
        .subscribe({
          next: (response) => {
            if (response.success && response.data.length > 0) {
              // Transform data for Excel export
              const excelData = response.data.map((item, index) => ({
                'Training ID': item.trainingId,
                'Training Institute ID': item.trainingInstituteId,
                'Trainees ID': item.id,
                Name: item.name,
                Gender: item.gender,
                Age: item.age,
                'Contact Number': item.contactNumber,
                Email: item.email,
                UIN: item.uin,
                'Father Name': item.fatherName,
                'Date of Birth': this.formatDate(item.dob),
                'Upload Type': item.uploadType,
                'Created Date': this.formatDate(item.createDate),
                'Approval Date': this.formatDate(item.approvedDate),
                'Approved by ': item.approvedBy,
              }));

              // Generate filename with timestamp
              const timestamp = new Date().toISOString().split('T')[0];
              const filename = `${kpiType}_${timestamp}`;

              // Export to Excel
              this.excelService.exportAsExcelFile(excelData, filename);

              console.log(
                `Successfully exported ${excelData.length} records for ${kpiType}`
              );
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
          },
        });
    }
  }
  getDashboardTitle(): string {
    if (this.userRole === 1) {
      return 'Central Admin Dashboard';
    } else if (this.userRole === 5) {
      return 'State Admin Dashboard';
    } else if (this.userRole === 6) {
      return 'Organization Dashboard';
    } else {
      return 'Training Dashboard';
    }
  }
}

