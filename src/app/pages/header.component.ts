import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationDropdownComponent, Notification } from '../components/notification-dropdown/notification-dropdown.component';

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
  
  // Mock Notification Data
  mockNotifications: Notification[] = [
    {
      id: 1,
      title: 'Frankie Sullivan commented on your post',
      message: 'This is looking great! Let\'s get started on it.',
      type: 'info',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false
    },
    {
      id: 5,
      title: 'New Training Institute Registration',
      message: 'A new training institute has registered and is pending approval.',
      type: 'registration',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      read: false
    },
    {
      id: 6,
      title: 'Training Completion Approval',
      message: 'A training batch has completed their course and is awaiting approval.',
      type: 'info',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      read: false
    }
  ];

  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
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
    const notification = this.mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead(): void {
    this.mockNotifications.forEach(notification => {
      notification.read = true;
    });
  }

  deleteNotification(notificationId: number): void {
    const index = this.mockNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.mockNotifications.splice(index, 1);
    }
  }

  getUnreadCount(): number {
    return this.mockNotifications.filter(n => !n.read).length;
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
