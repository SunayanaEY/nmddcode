import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardDataService } from './services/dashboard-data.service';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { IndiaMapComponent } from './components/india-map/india-map.component';
import { MonthlyChartComponent } from './components/monthly-chart/monthly-chart.component';
import { AgeGroupChartComponent } from './components/age-group-chart/age-group-chart.component';
import { ModeOfTrainingChartComponent } from './components/mode-of-training-chart/mode-of-training-chart.component';

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
  imports: [CommonModule, MonthlyChartComponent, IndiaMapComponent, StatsCardsComponent, AgeGroupChartComponent, ModeOfTrainingChartComponent]
})
export class PublicDashboardComponent implements OnInit {
  dashboardStats: DashboardStats = {
    totalTrainings: 54,
    totalFarmers: 3932,
    totalCertificatesApproved: 2912,
    totalCertificatesIssued: 1640,
    trainingGrowth: 8,
    farmerGrowth: 24,
    approvedGrowth: 37,
    issuedGrowth: 26
  };

  selectedState: StateData | null = null;
  isLoading = false;

  constructor(
    private router: Router,
    private dashboardService: DashboardDataService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.dashboardService.getTrainingSummaryCount().subscribe({
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
            issuedGrowth: 26
          };
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching training summary:', error);
        this.isLoading = false;
        // Keep default values on error
      }
    });
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
    console.log('Download certificate clicked');
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