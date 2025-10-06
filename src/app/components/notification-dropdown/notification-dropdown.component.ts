import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'registration' | 'completion';
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css']
})
export class NotificationDropdownComponent implements OnInit {
  @Input() show: boolean = false;
  @Input() notifications: Notification[] = [];
  @Input() isLoading: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<number>();
  @Output() markAllAsRead = new EventEmitter<void>();
  @Output() deleteNotification = new EventEmitter<number>();
  @Output() refresh = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {}

  onClose(): void {
    this.close.emit();
  }

  onMarkAsRead(notificationId: number): void {
    this.markAsRead.emit(notificationId);
  }

  onMarkAllAsRead(): void {
    this.markAllAsRead.emit();
  }

  onDeleteNotification(notificationId: number): void {
    this.deleteNotification.emit(notificationId);
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {

      if(localStorage.getItem('language')=='hi')
      {
         return 'Just now';
      }
      else{
        return 'बस अभी';
      }

    } else if (diffInHours < 24) {
      if(localStorage.getItem('language')=='hi')
      return `${diffInHours} घंटे${diffInHours > 1 ? 's' : ''} पहले`;

      else
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      if(localStorage.getItem('language')=='hi')
      return `${diffInDays} दिन${diffInDays > 1 ? 's' : ''} पहले`;

      else
         return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
