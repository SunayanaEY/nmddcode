import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../public-dashboard.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule,TranslateModule],
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
        category: 'trainings',
        value: this.stats?.totalTrainings || 0,
        growth: this.stats?.trainingGrowth || 0,
        growthText: 'from last Quarter',
        icon: 'fas fa-chalkboard-teacher',
        bgColor: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
        iconColor: '#4caf50',
        textColor: '#2e7d32'
      },
      {
        title: 'Total Personnel Trained',
        category: 'personnel',
        value: this.stats?.totalFarmers || 0,
        growth: this.stats?.farmerGrowth || 0,
        growthText: 'from last Quarter',
        icon: 'fas fa-users',
        bgColor: 'linear-gradient(135deg, #e8f5e8 0%, #a5d6a7 100%)',
        iconColor: '#66bb6a',
        textColor: '#388e3c'
      },
      {
        title: 'Total Certificates Approved',
        category: 'certificates-approved',
        value: this.stats?.totalCertificatesApproved || 0,
        growth: this.stats?.approvedGrowth || 0,
        growthText: 'from last Quarter',
        icon: 'fas fa-certificate',
        bgColor: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
        iconColor: '#e91e63',
        textColor: '#c2185b'
      },
      {
        title: 'Total Certificates Issued',
        category: 'certificates-issued',
        value: this.stats?.totalCertificatesIssued || 0,
        growth: this.stats?.issuedGrowth || 0,
        growthText: 'from last Quarter',
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

  downloadData(category: string, title: string, event?: MouseEvent): void {
    alert('Download button clicked!');
    try {
      // Prevent event bubbling and ensure clean execution
      event?.stopPropagation();
      
      // Show alert for testing purposes
      const message = `Download Request Initiated!\n\n` +
                     `📊 Data Type: ${title}\n` +
                     `🏷️ Category: ${category}\n` +
                     `📅 Date: ${new Date().toLocaleDateString()}\n\n` +
                     `This will download ${title.toLowerCase()} data in Excel format.`;
      
      alert(message);
      
      // Log for debugging
      console.log(`Download initiated for category: ${category}, title: ${title}`);
      
      // TODO: Implement actual download functionality
      // Example: this.downloadService.downloadData(category, title);
      
    } catch (error) {
      console.error('Error in downloadData:', error);
      alert('An error occurred while initiating the download. Please try again.');
    }
  }
}
