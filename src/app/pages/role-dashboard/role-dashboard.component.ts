import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { BreadcrumbComponent, BreadcrumbItem } from '../../components/breadcrumb/breadcrumb.component';
import { LocationService, State, District } from '../../services/location.service';
import { TrainingService } from '../training/services/training.service';
import { RoleDashboardService, RoleDashboardStats, TrainingDataResponse, TraineeDataResponse, TrainerDataResponse, TrainingTypeResponse, TrainingTypeData } from './role-dashboard.service';
import { ExcelService } from '../../_services/Excel/excel.service';
import { forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

// Interface for KPI Card
interface KpiCard {
  id: string;
  title: string;
  value: number;
  icon: string;
  colorClass: string;
  growth: {
    value: string;
    isPositive: boolean;
  };
  isPieChart?: boolean;
}

@Component({
  selector: 'app-role-dashboard',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, ReactiveFormsModule, NgxEchartsDirective, TranslateModule],
  templateUrl: './role-dashboard.component.html',
  styleUrls: ['./role-dashboard.component.css']
})
export class RoleDashboardComponent implements OnInit {
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '' }
  ];

  userRole: number = 0;
  userName: string = '';
  trainingInstituteId: string = '';

  // Dashboard statistics
  dashboardStats: RoleDashboardStats = {
    totalTrainingsApproved: 0,
    totalTrainingsRejected: 0,
    totalTraineesApproved: 0,
    totalTraineesRejected: 0,
    recommendedTrainees:0
  };

  // Filter form and data
  filterForm: FormGroup;
  states: State[] = [];
  districts: District[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingStates = false;
  isLoadingDistricts = false;
  
  // Selected values
  selectedStateId: number | null = null;
  selectedDistrictId: number | null = null;

  // Pie chart properties
  trainingTypesChartOption: EChartsOption = {};
  isTrainingTypesChartLoading = false;
  hasTrainingTypesData = false;

  // Trainer count
  trainerCount: number = 0;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private trainingService: TrainingService,
    private roleDashboardService: RoleDashboardService,
    private excelService: ExcelService
  ) {
    this.filterForm = this.fb.group({
      stateId: [''],
      districtId: ['']
    });
  }

  ngOnInit(): void {
    this.getUserInfo();
    this.loadStates();
    this.loadDashboardData();
    this.loadTrainerCount();
    this.setupFormSubscriptions();
    this.loadTrainingTypesChart();
  }

  private getUserInfo(): void {
    try {
      const userData = sessionStorage.getItem('user');
      const userInfo = sessionStorage.getItem('userInfo');
      
      console.log('Session storage contents:');
      console.log('user:', userData);
      console.log('userInfo:', userInfo);
      
      if (userData) {
        const user = JSON.parse(userData);
        this.userRole = user.role || 0;
        this.userName = user.name || user.operatorName || 'User';
        this.trainingInstituteId = user.trainingHeadId;
        
        console.log('Parsed user data:', user);
        console.log('User role set to:', this.userRole);
      }
      
      if (userInfo) {
        const parsedUserInfo = JSON.parse(userInfo);
        console.log('Parsed userInfo:', parsedUserInfo);
      }
    } catch (error) {
      console.error('Error parsing user data from session storage:', error);
    }
  }

  getRoleName(): string {
    switch (this.userRole) {
      case 3:
        return 'Training Head';
      case 4:
        return 'Data Entry Operator';
      default:
        return 'User';
    }
  }

  /**
   * Setup form value change subscriptions
   */
  setupFormSubscriptions(): void {
    // State change subscription
    this.filterForm.get('stateId')?.valueChanges.subscribe(stateId => {
      this.selectedStateId = stateId ? parseInt(stateId) : null;
      this.districts = [];
      this.filterForm.patchValue({ districtId: '' });
      this.selectedDistrictId = null;
      
      if (stateId) {
        this.loadDistricts(parseInt(stateId));
      }
      this.loadDashboardData();
    });

    // District change subscription
    this.filterForm.get('districtId')?.valueChanges.subscribe(districtId => {
      this.selectedDistrictId = districtId ? parseInt(districtId) : null;
      this.loadDashboardData();
    });
  }

  /**
   * Load states from API
   */
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

  /**
   * Load districts for selected state
   */
  loadDistricts(stateId: number): void {
    this.isLoadingDistricts = true;
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

  /**
   * Load dashboard statistics data
   */
  loadDashboardData(): void {
    this.isLoading = true;
    
    // Get selected filter values and convert to strings
    const stateId = this.selectedStateId ? this.selectedStateId.toString() : undefined;
    const districtId = this.selectedDistrictId ? this.selectedDistrictId.toString() : undefined;
    
    // Use the new API endpoint to get all training and trainee counts
    this.roleDashboardService.getTrainingTraineeCounts(stateId, districtId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardStats = response.data;
        } else {
          console.error('API returned unsuccessful response:', response.message);
          this.loadMockData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data if API fails
        this.loadMockData();
        this.isLoading = false;
      }
    });
  }

  /**
   * Load mock data as fallback
   */
  private loadMockData(): void {
    this.dashboardStats = {
      totalTrainingsApproved: 0,
      totalTrainingsRejected: 0,
      totalTraineesApproved: 0,
      totalTraineesRejected: 0,
      recommendedTrainees: 0
    };
  }

  /**
   * Test method to manually test trainer count API
   */
  testTrainerCountAPI(): void {
    console.log('Testing trainer count API...');
    
    // First test with the ID from session storage
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    let sessionId =  this.trainingInstituteId;
    
    
    if (sessionId) {
      console.log('Testing with session storage ID:', sessionId);
      this.roleDashboardService.getTrainerCount(sessionId).subscribe({
        next: (response) => {
          console.log('Session ID API response:', response);
          alert(`Session ID API Success: ${JSON.stringify(response)}`);
        },
        error: (error) => {
          console.error('Session ID API error:', error);
          alert(`Session ID API Error: ${error.message || error}`);
        }
      });
    }
    
    // Also test with the hardcoded ID you provided
    const testId = 'e8f5be7e-a829-4d82-a9bb-8ac901db76da'; // From your example
    console.log('Testing with hardcoded ID:', testId);
    
    this.roleDashboardService.getTrainerCount(testId).subscribe({
      next: (response) => {
        console.log('Hardcoded ID API response:', response);
        alert(`Hardcoded ID API Success: ${JSON.stringify(response)}`);
      },
      error: (error) => {
        console.error('Hardcoded ID API error:', error);
        alert(`Hardcoded ID API Error: ${error.message || error}`);
      }
    });
  }

  /**
   * Load trainer count from API
   */
  loadTrainerCount(): void {
    console.log('loadTrainerCount called, userRole:', this.userRole);
    
    if (this.userRole === 3) {
      // Try to get training head ID from multiple possible sources
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
      const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
      
      // Try multiple possible keys for the training head ID
      let trainingHeadId = userInfo.trainingHeadId || 
                          userInfo.trainingInstituteHeadId || 
                          userData.trainingHeadId || 
                          userData.trainingInstituteHeadId ||
                          userData.trainingInstituteId ||
                          userData.training_institute_id ||
                          this.trainingInstituteId;

      console.log('userInfo from session storage:', userInfo);
      console.log('userData from session storage:', userData);
      console.log('trainingHeadId found:', trainingHeadId);
      console.log('this.trainingInstituteId:', this.trainingInstituteId);

      if (!trainingHeadId) {
        console.error('Training head ID not found in any session storage location');
        console.log('Available keys in userInfo:', Object.keys(userInfo));
        console.log('Available keys in userData:', Object.keys(userData));
        this.trainerCount = 0;
        return;
      }

      console.log('Making API call to get trainer count with trainingHeadId:', trainingHeadId);
      this.roleDashboardService.getTrainerCount(trainingHeadId).subscribe({
        next: (response) => {
          console.log('Trainer count API response:', response);
          if (response.success && response.data) {
            // Convert to integer to avoid decimal display
            this.trainerCount = Math.floor(response.data["trainer Count"]);
            console.log('Trainer count set to:', this.trainerCount);
          } else {
            console.error('API returned unsuccessful response:', response.message);
            this.trainerCount = 0;
          }
        },
        error: (error) => {
          console.error('Error loading trainer count:', error);
          this.trainerCount = 0;
        }
      });
    } else {
      console.log('User role is not 3, skipping trainer count load');
    }
  }

  /**
   * Get statistics cards data for display
   */
  getStatsCards(): KpiCard[] {
    const baseCards: KpiCard[] = [
      {
        id: 'totalTrainingsApproved',
        title: 'Training Schedule Approved',
        value: this.dashboardStats.totalTrainingsApproved,
        icon: 'fas fa-check-circle',
        colorClass: 'kpi-card-green',
        growth: {
          value: '↑ 12% from last month',
          isPositive: true
        }
      },
      {
        id: 'totalTrainingsRejected',
        title: 'Training Schedule Rejected',
        value: this.dashboardStats.totalTrainingsRejected,
        icon: 'fas fa-times-circle',
        colorClass: 'kpi-card-orange',
        growth: {
          value: '↓ 8% from last month',
          isPositive: false
        }
      },
      {
        id: 'totalTraineesApproved',
        title: 'Trainees Approved',
        value: this.dashboardStats.totalTraineesApproved,
        icon: 'fas fa-user-check',
        colorClass: 'kpi-card-blue',
        growth: {
          value: '↑ 15% from last month',
          isPositive: true
        }
      },
      {
        id: 'totalTraineesRejected',
        title: 'Trainees Rejected',
        value: this.dashboardStats.totalTraineesRejected,
        icon: 'fas fa-user-times',
        colorClass: 'kpi-card-purple',
        growth: {
          value: '↓ 5% from last month',
          isPositive: false
        }
      }
    ];

    // Add extra KPIs for role 3 users
    if (this.userRole === 3) {
      baseCards.push(
        {
          id: 'registeredTrainers',
          title: 'Count of Registered Trainers',
          value: this.trainerCount,
          icon: 'fas fa-chalkboard-teacher',
          colorClass: 'kpi-card-teal',
          growth: {
            value: '↑ 7% from last month',
            isPositive: true
          }
        },
        {
          id: 'traineeRecommendedCertification',
          title: 'Trainee Recommended for Certification',
          value: this.dashboardStats.recommendedTrainees,
          icon: 'fas fa-certificate',
          colorClass: 'kpi-card-indigo',
          growth: {
            value: '↑ 10% from last month',
            isPositive: true
          }
        }
      );
    }

    return baseCards;
  }

  /**
   * Get KPI cards data for display (alias for getStatsCards)
   */
  getKpiCards(): KpiCard[] {
    return this.getStatsCards();
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

    // Show loading state
    const button = event.target as HTMLButtonElement;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    button.disabled = true;

    // Determine the API endpoint and data type based on kpiType
    switch (kpiType) {
      case 'totalTrainingsApproved':
        this.downloadTrainingData('approved', 'Training Schedule Approved', button, originalText);
        break;
      case 'totalTrainingsRejected':
        this.downloadTrainingData('rejected', 'Training Schedule Rejected', button, originalText);
        break;
      case 'totalTraineesApproved':
        this.downloadTraineeData('approved', 'Trainees Approved', button, originalText);
        break;
      case 'totalTraineesRejected':
        this.downloadTraineeData('rejected', 'Trainees Rejected', button, originalText);
        break;
      case 'registeredTrainers':
        this.downloadTrainerData('Registered Trainers', button, originalText);
        break;
      case 'traineeRecommendedCertification':
        this.downloadRecommendedTraineesData('Trainee Recommended for Certification', button, originalText);
        break;
      default:
        console.warn('Unknown KPI type:', kpiType);
        button.innerHTML = originalText;
        button.disabled = false;
        return;
    }
  }

  /**
   * Download training data as Excel file
   */
  private downloadTrainingData(type: 'approved' | 'rejected', cardTitle: string, button: HTMLButtonElement, originalText: string): void {
    const apiCall = type === 'approved' 
      ? this.roleDashboardService.getApprovedTrainingData()
      : this.roleDashboardService.getRejectedTrainingData();

    apiCall.subscribe({
      next: (response: TrainingDataResponse) => {
        if (response.success && response.data && response.data.length > 0) {
          // Transform training data for Excel export
          const excelData = response.data.map(item => ({
            'Training ID': item.id,
            'Training Title': item.trainingTitle,
            'Scheme': item.scheme,
            'Training Institute': item.trainingInstituteName,
            'Trainer Name': item.trainerName,
            'Venue State': item.venueState,
            'Venue District': item.venueDistrict,
            'Venue Block': item.venueBlock,
            'Start Date': new Date(item.startDate).toLocaleDateString(),
            'End Date': new Date(item.endDate).toLocaleDateString(),
            'Duration': `${item.duration} ${item.durationType}`,
            'Training Type': item.trainingType,
            'Mode of Training': item.modeOfTraining,
            'Status': item.status,
            'Created Date': new Date(item.createDate).toLocaleDateString(),
            'Updated By': item.updatedBy,
            'Updated Date': new Date(item.updateDate).toLocaleDateString(),
            'Description': item.trainingDescription
          }));

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `${cardTitle.replace(/\s+/g, '_')}_${timestamp}`;

          // Export to Excel
          this.excelService.exportAsExcelFile(excelData, filename);
          
          console.log(`Successfully exported ${excelData.length} training records for ${cardTitle}`);
        } else {
          console.warn('No training data available for export');
          alert('No training data available for export');
        }

        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      },
      error: (error) => {
        console.error('Error downloading training data:', error);
        alert('Error downloading training data. Please try again.');
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
  }

  /**
   * Download trainee data as Excel file
   */
  private downloadTraineeData(type: 'approved' | 'rejected', cardTitle: string, button: HTMLButtonElement, originalText: string): void {
    const apiCall = type === 'approved' 
      ? this.roleDashboardService.getApprovedTraineeData()
      : this.roleDashboardService.getRejectedTraineeData();

    apiCall.subscribe({
      next: (response: TraineeDataResponse) => {
        if (response.success && response.data && response.data.length > 0) {
          // Transform trainee data for Excel export
          const excelData = response.data.map(item => ({
            'Trainee ID': item.id,
            'Name': item.name,
            'Father Name': item.fatherName,
            'Gender': item.gender,
            'Age': item.age,
            'Date of Birth': new Date(item.dob).toLocaleDateString(),
            'Contact Number': item.contactNumber,
            'Email': item.email,
            'UIN': item.uin,
            'Status': item.status,
            'Training ID': item.trainingId,
            'Training Name': item.trainingName,
            'Training Institute': item.trainingInstituteName,
            'Upload Type': item.uploadType,
            'Uploaded By': item.uploadedBy || 'N/A',
            'Created By': item.createdBy,
            'Created Date': new Date(item.createDate).toLocaleDateString(),
            'Updated By': item.updatedBy || 'N/A',
            'Updated Date': new Date(item.updateDate).toLocaleDateString(),
            'Rejection Remarks': item.rejectionRemarks || 'N/A'
          }));

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `${cardTitle.replace(/\s+/g, '_')}_${timestamp}`;

          // Export to Excel
          this.excelService.exportAsExcelFile(excelData, filename);
          
          console.log(`Successfully exported ${excelData.length} trainee records for ${cardTitle}`);
        } else {
          console.warn('No trainee data available for export');
          alert('No trainee data available for export');
        }

        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      },
      error: (error) => {
        console.error('Error downloading trainee data:', error);
        alert('Error downloading trainee data. Please try again.');
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
  }

  /**
   * Download recommended trainees data as Excel file
   */
  private downloadRecommendedTraineesData(cardTitle: string, button: HTMLButtonElement, originalText: string): void {
    this.roleDashboardService.getRecommendedTraineesData().subscribe({
      next: (response: TraineeDataResponse) => {
        if (response.success && response.data && response.data.length > 0) {
          // Transform recommended trainees data for Excel export
          const excelData = response.data.map(item => ({
            'Trainee ID': item.id,
            'Name': item.name,
            'Father Name': item.fatherName,
            'Gender': item.gender,
            'Age': item.age,
            'Date of Birth': new Date(item.dob).toLocaleDateString(),
            'Contact Number': item.contactNumber,
            'Email': item.email,
            'UIN': item.uin,
            'Status': item.status,
            'Training ID': item.trainingId,
            'Training Name': item.trainingName,
            'Training Institute': item.trainingInstituteName,
            'Upload Type': item.uploadType,
            'Uploaded By': item.uploadedBy || 'N/A',
            'Created By': item.createdBy,
            'Created Date': new Date(item.createDate).toLocaleDateString(),
            'Updated By': item.updatedBy || 'N/A',
            'Updated Date': new Date(item.updateDate).toLocaleDateString(),
            'Rejection Remarks': item.rejectionRemarks || 'N/A'
          }));

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `${cardTitle.replace(/\s+/g, '_')}_${timestamp}`;

          // Export to Excel
          this.excelService.exportAsExcelFile(excelData, filename);
          
          console.log(`Successfully exported ${excelData.length} recommended trainee records for ${cardTitle}`);
        } else {
          console.warn('No recommended trainee data available for export');
          alert('No recommended trainee data available for export');
        }

        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      },
      error: (error) => {
        console.error('Error downloading recommended trainee data:', error);
        alert('Error downloading recommended trainee data. Please try again.');
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
  }

  /**
   * Download trainer data as Excel file
   */
  private downloadTrainerData(cardTitle: string, button: HTMLButtonElement, originalText: string): void {
    // Get training head ID from session storage
    const trainingHeadId = this.trainingInstituteId;

    if (!trainingHeadId) {
      console.error('Training head ID not found in session storage');
      alert('Training head ID not found. Please login again.');
      button.innerHTML = originalText;
      button.disabled = false;
      return;
    }

    const apiCall = this.roleDashboardService.getTrainerDataByTrainingHead(trainingHeadId);

    apiCall.subscribe({
      next: (response: TrainerDataResponse) => {
        if (response.success && response.data && response.data.length > 0) {
          // Transform trainer data for Excel export
          const excelData = response.data.map(item => ({
            'Trainer ID': item.id,
            'Trainer Name': item.trainerName,
            'Mobile': item.mobile,
            'Email': item.email,
            'Expertise In': item.expertiseIn,
          }));

          // Generate filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          const filename = `${cardTitle.replace(/\s+/g, '_')}_${timestamp}`;

          // Export to Excel
          this.excelService.exportAsExcelFile(excelData, filename);
          
          console.log(`Successfully exported ${excelData.length} trainer records for ${cardTitle}`);
        } else {
          console.warn('No trainer data available for export');
          alert('No trainer data available for export');
        }

        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      },
      error: (error) => {
        console.error('Error downloading trainer data:', error);
        alert('Error downloading trainer data. Please try again.');
        
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
      }
    });
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.selectedStateId = null;
    this.selectedDistrictId = null;
    this.districts = [];
    this.loadDashboardData();
  }

  /**
   * Load and configure training types pie chart
   */
  loadTrainingTypesChart(): void {
    this.isTrainingTypesChartLoading = true;
    this.hasTrainingTypesData = false;

    // Initialize with empty chart
    this.initializeEmptyTrainingTypesChart();

    // Check if we have a training institute ID
    if (!this.trainingInstituteId) {
      console.error('Training institute ID not found');
      this.isTrainingTypesChartLoading = false;
      return;
    }

    // Call the API to get training types data
    this.roleDashboardService.getTrainingTypesByInstitute(this.trainingInstituteId).subscribe({
      next: (response: TrainingTypeResponse) => {
        if (response.success && response.data && response.data.length > 0) {
          this.configureTrainingTypesChart(response.data);
          this.hasTrainingTypesData = true;
        } else {
          console.warn('No training types data found');
          this.hasTrainingTypesData = false;
        }
        this.isTrainingTypesChartLoading = false;
      },
      error: (error) => {
        console.error('Error loading training types data:', error);
        this.hasTrainingTypesData = false;
        this.isTrainingTypesChartLoading = false;
      }
    });
  }

  /**
   * Configure the training types chart with API data
   */
  private configureTrainingTypesChart(data: TrainingTypeData[]): void {
    // Transform API data to chart format
    const chartData = data.map(item => ({
      name: item.trainingTypeName,
      value: item.totalTrainings
    }));

    this.trainingTypesChartOption = {
      title: {
        text: 'No of Training Type',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const dataItem = data.find(item => item.trainingTypeName === params.name);
          return `${params.seriesName}<br/>${params.name}: ${params.value} (${dataItem?.percentage.toFixed(2)}%)`;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: chartData.map(item => item.name)
      },
      series: [
        {
          name: 'Training Types',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    };
  }

  /**
   * Initialize empty training types chart
   */
  private initializeEmptyTrainingTypesChart(): void {
    this.trainingTypesChartOption = {
      title: {
        text: 'No of Training Type',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: 'No data available',
          fontSize: 14,
          fill: '#999'
        }
      },
      series: []
    };
  }

  /**
   * Load mock data as fallback for training types chart
   */
  private loadMockTrainingTypesChart(): void {
    const trainingTypesData = [
      { name: 'Technical Training', value: 35 },
      { name: 'Soft Skills', value: 25 },
      { name: 'Leadership', value: 20 },
      { name: 'Safety Training', value: 15 },
      { name: 'Others', value: 5 }
    ];

    this.trainingTypesChartOption = {
      title: {
        text: 'No of Training Type',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: trainingTypesData.map(item => item.name)
      },
      series: [
        {
          name: 'Training Types',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '60%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: trainingTypesData
        }
      ]
    };
  }
}