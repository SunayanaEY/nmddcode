import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationDropdownComponent, Notification } from '../components/notification-dropdown/notification-dropdown.component';
import { AdminService, NotificationItem } from './training/services/training-admin.service';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private adminService: AdminService,private translate: TranslateService) {}

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoadingNotifications = true;
    this.adminService.getNotifications().subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications = this.transformToNotifications(response.data);
        } else {
          console.error('Failed to load notifications:', response.message);
          this.notifications = [];
        }
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

  private transformToNotifications(notificationItems: NotificationItem[]): Notification[] {
    return notificationItems.map(item => ({
      id: item.id,
      title: item.title,
      message: item.description,
      type: 'info' as const,
      timestamp: new Date(item.createdAt),
      read: item.read
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

    this.translate.use(this.currentLanguage);
    localStorage.setItem('language', this.currentLanguage);
   // this.currentLang=LANGULAGES.find(lang => lang.code == localStorage.getItem('language')).name
   // this.languageService.changeLang(language);


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

  onNotificationRead(notificationId: number): void {
    // Find and mark the notification as read locally
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;

      // Call API to mark notification as seen
      this.adminService.markNotificationsAsSeen([notificationId]).subscribe({
        next: (response) => {
          if (!response.success) {
            console.error('Failed to mark notification as seen:', response.message);
            // Revert the local change if API call failed
            notification.read = false;
          }
        },
        error: (error) => {
          console.error('Error marking notification as seen:', error);
          // Revert the local change if API call failed
          notification.read = false;
        }
      });
    }
  }

  onMarkAllAsRead(): void {
    // Get all unread notification IDs
    const unreadNotificationIds = this.notifications
      .filter(n => !n.read)
      .map(n => n.id);

    if (unreadNotificationIds.length === 0) {
      return; // No unread notifications
    }

    // Mark all notifications as read locally
    this.notifications.forEach(notification => {
      notification.read = true;
    });

    // Call API to mark all notifications as seen
    this.adminService.markNotificationsAsSeen(unreadNotificationIds).subscribe({
      next: (response) => {
        if (!response.success) {
          console.error('Failed to mark all notifications as seen:', response.message);
          // Revert the local changes if API call failed
          this.notifications.forEach(notification => {
            if (unreadNotificationIds.includes(notification.id)) {
              notification.read = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error marking all notifications as seen:', error);
        // Revert the local changes if API call failed
        this.notifications.forEach(notification => {
          if (unreadNotificationIds.includes(notification.id)) {
            notification.read = false;
          }
        });
      }
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
