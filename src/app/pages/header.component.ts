import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationDropdownComponent, Notification } from '../components/notification-dropdown/notification-dropdown.component';
import { AdminService, NewRegisteredInstitute } from './training/services/training-admin.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NotificationDropdownComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() user: { username: string; email: string; role: number } | null =
    null;
  currentLanguage: 'en' | 'hi' = 'en';
  
  // Notification Dropdown Properties
  showNotificationDropdown = false;
  
  // Notification Data
  notifications: Notification[] = [];
  isLoadingNotifications = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoadingNotifications = true;
    this.adminService.getAllNewRegisteredInstitutes().subscribe({
      next: (institutes: NewRegisteredInstitute[]) => {
        this.notifications = this.transformToNotifications(institutes);
        this.isLoadingNotifications = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoadingNotifications = false;
        // Fallback to empty notifications on error
        this.notifications = [];
      }
    });
  }

  private transformToNotifications(institutes: NewRegisteredInstitute[]): Notification[] {
    return institutes.map((institute, index) => ({
      id: index + 1,
      title: 'New Training Institute Registration',
      message: `${institute.trainingInstituteName} (${institute.contactPersonName}) has registered and is pending approval. Registration ID: ${institute.registrationId}`,
      type: 'registration' as const,
      timestamp: new Date(institute.createdAt),
      read: false
    }));
  }

  // get userRole(): string {
  //   debugger;
  //   if (this.user?.role === 2) {
  //     return 'Administrator';
  //   } else if (this.user?.role === 1) {
  //     return 'User';
  //   } else {
  //     return 'Guest';
  //   }
  // }
  toggleLanguage(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.currentLanguage = isChecked ? 'hi' : 'en';
    console.log('Language switched to:', this.currentLanguage);

    // Optional: if using ngx-translate
    // this.translateService.use(this.currentLanguage);
  }

  // Notification Methods
  openNotificationDropdown(): void {
    this.showNotificationDropdown = true;
  }

  closeNotificationDropdown(): void {
    this.showNotificationDropdown = false;
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }

  deleteNotification(notificationId: number): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  refreshNotifications(): void {
    this.loadNotifications();
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  }
}
