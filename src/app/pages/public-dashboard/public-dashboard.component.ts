import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardDataService } from './services/dashboard-data.service';
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
  imports: [
    CommonModule,
    ModalComponent,
    MonthlyChartComponent,
    IndiaMapComponent,
    StatsCardsComponent,
    AgeGroupChartComponent,
    ModeOfTrainingChartComponent,
    ModalComponent,
    CertificateLayoutComponent,
  ],
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

  constructor(
    private router: Router,
    private dashboardService: DashboardDataService,
    private trainingsService: TrainingService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    // TODO: Implement API call to fetch dashboard data
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
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
    alert('Download certificate clicked');
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
