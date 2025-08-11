import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject, delay } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface DashboardStats {
  totalTrainings: {
    value: number;
    growth: number;
    isPositive: boolean;
  };
  totalFarmers: {
    value: number;
    growth: number;
    isPositive: boolean;
  };
  totalCertificatesApproved: {
    value: number;
    growth: number;
    isPositive: boolean;
  };
  totalCertificatesIssued: {
    value: number;
    growth: number;
    isPositive: boolean;
  };
}

export interface StateData {
  stateId: string;
  stateName: string;
  totalInstitutes: number;
  totalTrainings: number;
  totalFarmers: number;
  coordinates: [number, number];
}

export interface InstituteData {
  id: string;
  name: string;
  stateId: string;
  coordinates: [number, number];
  totalTrainings: number;
  totalFarmers: number;
  type: 'primary' | 'secondary' | 'research';
}

export interface MonthlyData {
  month: string;
  trainings: number;
  farmers: number;
  certificates: number;
}

export interface AgeGroupData {
  ageGroup: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ModeOfTrainingData {
  mode: string;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  private readonly API_BASE_URL = '/api/dashboard'; // TODO: Replace with actual API URL
  
  // BehaviorSubjects for reactive data
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private selectedStateSubject = new BehaviorSubject<StateData | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();
  public selectedState$ = this.selectedStateSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  // Mock data - TODO: Replace with actual API calls
  private mockDashboardStats: DashboardStats = {
    totalTrainings: {
      value: 54,
      growth: 8.2,
      isPositive: true
    },
    totalFarmers: {
      value: 3932,
      growth: 12.5,
      isPositive: true
    },
    totalCertificatesApproved: {
      value: 2912,
      growth: 5.8,
      isPositive: true
    },
    totalCertificatesIssued: {
      value: 1640,
      growth: -2.1,
      isPositive: false
    }
  };

  private mockStatesData: StateData[] = [
    {
      stateId: 'UP',
      stateName: 'Uttar Pradesh',
      totalInstitutes: 12,
      totalTrainings: 18,
      totalFarmers: 1250,
      coordinates: [80.9462, 26.8467]
    },
    {
      stateId: 'MH',
      stateName: 'Maharashtra',
      totalInstitutes: 8,
      totalTrainings: 12,
      totalFarmers: 890,
      coordinates: [75.7139, 19.7515]
    },
    {
      stateId: 'GJ',
      stateName: 'Gujarat',
      totalInstitutes: 6,
      totalTrainings: 9,
      totalFarmers: 650,
      coordinates: [71.1924, 22.2587]
    },
    {
      stateId: 'RJ',
      stateName: 'Rajasthan',
      totalInstitutes: 5,
      totalTrainings: 7,
      totalFarmers: 480,
      coordinates: [74.2179, 27.0238]
    },
    {
      stateId: 'PB',
      stateName: 'Punjab',
      totalInstitutes: 4,
      totalTrainings: 8,
      totalFarmers: 420,
      coordinates: [75.3412, 31.1471]
    }
  ];

  private mockInstitutesData: InstituteData[] = [
    {
      id: 'inst_001',
      name: 'National Dairy Research Institute',
      stateId: 'UP',
      coordinates: [80.9462, 26.8467],
      totalTrainings: 8,
      totalFarmers: 450,
      type: 'research'
    },
    {
      id: 'inst_002',
      name: 'Dairy Training Center Mumbai',
      stateId: 'MH',
      coordinates: [72.8777, 19.0760],
      totalTrainings: 6,
      totalFarmers: 320,
      type: 'primary'
    },
    {
      id: 'inst_003',
      name: 'Gujarat Cooperative Milk Marketing Federation',
      stateId: 'GJ',
      coordinates: [72.5714, 23.0225],
      totalTrainings: 5,
      totalFarmers: 280,
      type: 'primary'
    }
  ];

  private mockMonthlyData: MonthlyData[] = [
    { month: 'Jan', trainings: 45, farmers: 320, certificates: 280 },
    { month: 'Feb', trainings: 52, farmers: 380, certificates: 320 },
    { month: 'Mar', trainings: 48, farmers: 350, certificates: 300 },
    { month: 'Apr', trainings: 65, farmers: 420, certificates: 380 },
    { month: 'May', trainings: 58, farmers: 390, certificates: 350 },
    { month: 'Jun', trainings: 72, farmers: 480, certificates: 420 },
    { month: 'Jul', trainings: 68, farmers: 450, certificates: 400 },
    { month: 'Aug', trainings: 75, farmers: 520, certificates: 460 },
    { month: 'Sep', trainings: 82, farmers: 580, certificates: 520 },
    { month: 'Oct', trainings: 78, farmers: 550, certificates: 490 },
    { month: 'Nov', trainings: 85, farmers: 620, certificates: 560 },
    { month: 'Dec', trainings: 92, farmers: 680, certificates: 620 }
  ];

  // Initialize data on service creation
  private loadInitialData(): void {
    this.loadingSubject.next(true);
    
    // Simulate API call delay
    setTimeout(() => {
      this.dashboardStatsSubject.next(this.mockDashboardStats);
      this.loadingSubject.next(false);
    }, 1000);
  }

  // Get dashboard statistics
  getDashboardStats(): Observable<DashboardStats> {
    // TODO: Replace with actual HTTP call
    // return this.http.get<DashboardStats>(`${this.API_BASE_URL}/stats`);
    
    return of(this.mockDashboardStats).pipe(delay(500));
  }

  // Get all states data
  getStatesData(): Observable<StateData[]> {
    // TODO: Replace with actual HTTP call
    // return this.http.get<StateData[]>(`${this.API_BASE_URL}/states`);
    
    return of(this.mockStatesData).pipe(delay(300));
  }

  // Get institutes data
  getInstitutesData(stateId?: string): Observable<InstituteData[]> {
    // TODO: Replace with actual HTTP call
    // const url = stateId ? `${this.API_BASE_URL}/institutes?stateId=${stateId}` : `${this.API_BASE_URL}/institutes`;
    // return this.http.get<InstituteData[]>(url);
    
    let data = this.mockInstitutesData;
    if (stateId) {
      data = data.filter(institute => institute.stateId === stateId);
    }
    
    return of(data).pipe(delay(300));
  }

  // Get monthly trend data
  getMonthlyData(stateId?: string): Observable<MonthlyData[]> {
    // TODO: Replace with actual HTTP call
    // const url = stateId ? `${this.API_BASE_URL}/monthly?stateId=${stateId}` : `${this.API_BASE_URL}/monthly`;
    // return this.http.get<MonthlyData[]>(url);
    
    // For demo, return same data regardless of state
    return of(this.mockMonthlyData).pipe(delay(400));
  }

  // Get age group distribution data
  getAgeGroupData(stateId?: string): Observable<AgeGroupData[]> {
    // TODO: Replace with actual HTTP call
    // const url = stateId ? `${this.API_BASE_URL}/age-groups?stateId=${stateId}` : `${this.API_BASE_URL}/age-groups`;
    // return this.http.get<AgeGroupData[]>(url);
    
    const mockAgeGroupData: AgeGroupData[] = [
      { ageGroup: '18-25', count: 1250, percentage: 32, color: '#FF6B6B' },
      { ageGroup: '26-35', count: 1450, percentage: 37, color: '#4ECDC4' },
      { ageGroup: '36-45', count: 890, percentage: 23, color: '#45B7D1' },
      { ageGroup: '46-60', count: 310, percentage: 8, color: '#96CEB4' }
    ];
    
    return of(mockAgeGroupData).pipe(delay(400));
  }

  // Get training mode distribution data
  getTrainingModeData(stateId?: string): Observable<ModeOfTrainingData[]> {
    // TODO: Replace with actual HTTP call
    // const url = stateId ? `${this.API_BASE_URL}/training-modes?stateId=${stateId}` : `${this.API_BASE_URL}/training-modes`;
    // return this.http.get<ModeOfTrainingData[]>(url);
    
    const mockTrainingModeData: ModeOfTrainingData[] = [
      { mode: 'Online', count: 1580, percentage: 40, color: '#4F46E5', icon: 'laptop' },
      { mode: 'Offline', count: 1422, percentage: 36, color: '#059669', icon: 'users' },
      { mode: 'Hybrid', count: 632, percentage: 16, color: '#DC2626', icon: 'globe' },
      { mode: 'Field Training', count: 316, percentage: 8, color: '#D97706', icon: 'map-marker-alt' }
    ];
    
    return of(mockTrainingModeData).pipe(delay(400));
  }

  // Set selected state
  setSelectedState(state: StateData | null): void {
    this.selectedStateSubject.next(state);
  }

  // Get current selected state
  getSelectedState(): StateData | null {
    return this.selectedStateSubject.value;
  }

  // Set loading state
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  // Get current loading state
  getLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Refresh all data
  refreshData(): void {
    this.loadInitialData();
  }

  // Export data functionality
  exportData(format: 'csv' | 'excel' | 'pdf'): Observable<Blob> {
    // TODO: Implement actual export functionality
    console.log(`Exporting data in ${format} format`);
    
    // Mock implementation
    const mockData = 'Mock exported data';
    const blob = new Blob([mockData], { type: 'text/plain' });
    return of(blob).pipe(delay(1000));
  }

  // Download certificate functionality
  downloadCertificate(certificateId: string): Observable<Blob> {
    // TODO: Implement actual certificate download
    console.log(`Downloading certificate: ${certificateId}`);
    
    // Mock implementation
    const mockPdf = 'Mock PDF certificate data';
    const blob = new Blob([mockPdf], { type: 'application/pdf' });
    return of(blob).pipe(delay(1500));
  }

  // Search functionality
  searchData(query: string, filters?: any): Observable<any[]> {
    // TODO: Implement actual search functionality
    console.log(`Searching for: ${query}`, filters);
    
    // Mock implementation
    const mockResults = [
      { id: 1, title: 'Mock Result 1', type: 'training' },
      { id: 2, title: 'Mock Result 2', type: 'farmer' }
    ];
    
    return of(mockResults).pipe(delay(500));
  }
}