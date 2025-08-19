import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../services/auth.service';
import { ActivityLogService, ActivityLogItem } from '../services/activity-log.service';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.css']
})
export class ActivityLogComponent implements OnInit {
  activityLogs: ActivityLogItem[] = [];
  filteredLogs: ActivityLogItem[] = [];
  selectedFilter: string = 'all';
  userRole: number = 0;
  
  // Expose Math to template
  Math = Math;
  
  // Breadcrumb configuration
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', url: '/admin' },
    { label: 'Activity Log Feed' }
  ];
  
  // Pagination configuration
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  paginatedLogs: ActivityLogItem[] = [];
  
  // Date filter configuration
  startDate: string = '';
  endDate: string = '';
  originalLogs: ActivityLogItem[] = [];
  
  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private activityLogService: ActivityLogService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userRole = user.role;
    }
    this.loadActivityLogs();
    this.updatePagination();
  }

  loadActivityLogs(): void {
    // Get date range for API call (default to last 30 days if no dates selected)
    const fromDate = this.startDate || this.getDefaultFromDate();
    const toDate = this.endDate || this.getDefaultToDate();
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.activityLogService.getActivityLogs(fromDate, toDate).subscribe({
      next: (logs) => {
        this.activityLogs = logs;
        this.originalLogs = [...logs];
        this.filteredLogs = [...logs];
        this.filterLogs(this.selectedFilter);
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading activity logs:', error);
        this.errorMessage = 'Failed to load activity logs. Please try again later.';
        this.activityLogs = [];
        this.originalLogs = [];
        this.filteredLogs = [];
        this.updatePagination();
        this.isLoading = false;
      }
    });
  }

  /**
   * Get default from date (30 days ago)
   */
  private getDefaultFromDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get default to date (today)
   */
  private getDefaultToDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  /**
   * Load activity logs with mock data fallback
   */
  private loadMockActivityLogs(): void {
    // Fallback mock data for development/testing
    const logs = [
      {
        id: 'log_001',
        type: 'upload',
        title: 'Training Data Uploaded',
        description: 'Dairy Farming Basics training data uploaded for batch DF-2024-001',
        user: 'Rajesh Kumar (Data Entry Operator)',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'pending',
        details: {
          training: 'Dairy Farming Basics',
          institute: 'UP Dairy Training Institute, Lucknow',
          batch: 'DF-2024-001'
        }
      },
      {
        id: 'log_002',
        type: 'approval',
        title: 'Training Approved',
        description: 'Cattle Management training approved for certification',
        user: 'Dr. Priya Sharma (Training Coordinator)',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        status: 'approved',
        details: {
          training: 'Cattle Management',
          institute: 'UP Dairy Training Institute, Kanpur'
        }
      },
      {
        id: 'log_003',
        type: 'comment',
        title: 'Training Review Comment',
        description: 'Additional documentation required for Milk Quality Control training',
        user: 'Amit Singh (Quality Assurance)',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        status: 'pending',
        details: {
          training: 'Milk Quality Control',
          institute: 'UP Dairy Training Institute, Agra'
        }
      },
      {
        id: 'log_004',
        type: 'rejection',
        title: 'Training Rejected',
        description: 'Feed Management training rejected due to incomplete curriculum',
        user: 'Dr. Suresh Gupta (Academic Head)',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        status: 'rejected',
        details: {
          training: 'Feed Management',
          institute: 'UP Dairy Training Institute, Meerut',
          reason: 'Incomplete curriculum'
        }
      },
      {
        id: 'log_005',
        type: 'upload',
        title: 'New Training Module Added',
        description: 'Dairy Equipment Maintenance training module uploaded',
        user: 'Neha Verma (Content Developer)',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'approved',
        details: {
          training: 'Dairy Equipment Maintenance',
          institute: 'UP Dairy Training Institute, Varanasi'
        }
      },
      {
        id: 'log_006',
        type: 'approval',
        title: 'Certification Approved',
        description: 'Dairy Business Management certification approved for issuance',
        user: 'Ravi Prakash (Certification Officer)',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
        status: 'approved',
        details: {
          training: 'Dairy Business Management',
          institute: 'UP Dairy Training Institute, Allahabad'
        }
      }
    ];

    // Generate more mock data for pagination testing
    for (let i = 7; i <= 50; i++) {
      logs.push({
        id: `log_${i.toString().padStart(3, '0')}`,
        type: ['upload', 'approval', 'comment', 'rejection'][Math.floor(Math.random() * 4)] as any,
        title: `Activity ${i}`,
        description: `Sample activity description for item ${i}`,
        user: `User ${i}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        status: ['approved', 'pending', 'rejected'][Math.floor(Math.random() * 3)] as any,
        details: {
          training: `Training Module ${i}`,
          institute: `Institute ${i}`
        }
      });
    }
    
    this.activityLogs = logs;
    this.originalLogs = [...logs];
    
    this.filteredLogs = [...this.activityLogs];
  }

  filterLogs(status: string): void {
    this.selectedFilter = status;
    if (status === 'all') {
      this.filteredLogs = [...this.activityLogs];
    } else {
      this.filteredLogs = this.activityLogs.filter(log => log.status === status);
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'others': return 'status-others';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved':
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/></svg>';
      case 'others':
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      case 'rejected':
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9L9 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      default:
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/></svg>';
    }
  }
  
  getTypeIcon(type: string): string {
    switch (type) {
      case 'upload': return '📤';
      case 'approval': return '✅';
      case 'comment': return '💬';
      case 'rejection': return '❌';
      default: return '📋';
    }
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }
  }

  navigateToTrainingDetails(logItem: ActivityLogItem): void {
    // Navigate to training details page
    console.log('Navigate to training details:', logItem);
    // Example: this.router.navigate(['/admin/training/details', logItem.id]);
  }

  refreshLogs(): void {
    this.loadActivityLogs();
    this.updatePagination();
  }

  trackByLogId(index: number, item: ActivityLogItem): string {
    return item.id;
  }
  
  // Pagination methods
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredLogs.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLogs = this.filteredLogs.slice(startIndex, endIndex);
  }
  
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }
  
  previousPage() {
    this.goToPage(this.currentPage - 1);
  }
  
  nextPage() {
    this.goToPage(this.currentPage + 1);
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  // Date filter methods
  filterByDateRange(): void {
    if (this.startDate && this.endDate) {
      this.isLoading = true;
      this.errorMessage = '';
      
      // Use API service to fetch logs with date range
      this.activityLogService.getActivityLogs(this.startDate, this.endDate).subscribe({
        next: (logs) => {
          this.activityLogs = logs;
          this.originalLogs = [...logs];
          this.filteredLogs = [...logs];
          this.filterLogs(this.selectedFilter);
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error filtering activity logs by date:', error);
          this.errorMessage = 'Failed to filter activity logs. Please try again.';
          this.isLoading = false;
        }
      });
    } else {
      // If no date range is selected, reload all logs with default range
      this.loadActivityLogs();
    }
  }
  
  clearDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    // Reload logs with default date range
    this.loadActivityLogs();
  }
}