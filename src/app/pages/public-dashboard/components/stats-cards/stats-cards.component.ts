import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../public-dashboard.component';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css']
})
export class StatsCardsComponent {
  @Input() stats!: DashboardStats;
  @Input() isLoading = false;

  Math = Math;

  getStatsCards() {
    return [
      {
        title: 'Total Trainings Conducted',
        value: this.stats?.totalTrainings || 0,
        growth: this.stats?.trainingGrowth || 0,
        growthText: 'from June',
        icon: 'fas fa-chalkboard-teacher',
        bgColor: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
        iconColor: '#4caf50',
        textColor: '#2e7d32'
      },
      {
        title: 'Total Personnel Trained',
        value: this.stats?.totalFarmers || 0,
        growth: this.stats?.farmerGrowth || 0,
        growthText: 'from June',
        icon: 'fas fa-users',
        bgColor: 'linear-gradient(135deg, #e8f5e8 0%, #a5d6a7 100%)',
        iconColor: '#66bb6a',
        textColor: '#388e3c'
      },
      {
        title: 'Total Certificates Approved',
        value: this.stats?.totalCertificatesApproved || 0,
        growth: this.stats?.approvedGrowth || 0,
        growthText: 'from June',
        icon: 'fas fa-certificate',
        bgColor: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
        iconColor: '#e91e63',
        textColor: '#c2185b'
      },
      {
        title: 'Total Certificates Issued',
        value: this.stats?.totalCertificatesIssued || 0,
        growth: this.stats?.issuedGrowth || 0,
        growthText: 'from June',
        icon: 'fas fa-award',
        bgColor: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        iconColor: '#2196f3',
        textColor: '#1976d2'
      }
    ];
  }

  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  }

  getGrowthClass(growth: number): string {
    return growth >= 0 ? 'text-success' : 'text-danger';
  }
}
