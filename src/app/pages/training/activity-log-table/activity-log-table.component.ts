import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from '../../../components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../services/auth.service';
import { ActivityLogService, ActivityLogItem } from '../services/activity-log.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-activity-log-table',
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent, TranslateModule],
  templateUrl: './activity-log-table.component.html',
  styleUrls: ['./activity-log-table.component.css']
})
export class ActivityLogTableComponent implements OnInit {
  activityLogs: ActivityLogItem[] = [];
  filteredLogs: ActivityLogItem[] = [];
  paginatedLogs: ActivityLogItem[] = [];

  selectedFilter: string = 'all';
  userRole: number = 0;

  // Breadcrumb configuration
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Training Module', url: '/admin' },
    { label: 'Activity Log Feed' }
  ];

  // Pagination configuration
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  // Date filter configuration
  startDate: string = '';
  endDate: string = '';
  originalLogs: ActivityLogItem[] = [];

  // Loading and error states
  isLoading: boolean = false;
  errorMessage: string = '';

  // Expose Math to template
  Math = Math;

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

  private getDefaultFromDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  private getDefaultToDate(): string {
    return new Date().toISOString().split('T')[0];
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
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      if (hours === 0) hours = 12;
      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return timestamp?.toString() ?? '';
    }
  }

  refreshLogs(): void {
    this.loadActivityLogs();
    this.updatePagination();
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
      if (this.startDate > this.endDate) {
        alert('End Date cannot be before Start Date');
        return;
      }
      this.isLoading = true;
      this.errorMessage = '';

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
      this.loadActivityLogs();
    }
  }

  clearDateFilter(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadActivityLogs();
  }

  trackByLogId(index: number, item: ActivityLogItem): string | number {
    return item.id ?? index;
  }

  blockKeyboard(event: KeyboardEvent): void {
    // Allow tab for navigation; block other keys to prevent typing
    if (event.key !== 'Tab') {
      event.preventDefault();
    }
  }
}