import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css']
})
export class NotificationDropdownComponent implements OnInit {
  @Input() show: boolean = false;
  @Input() notifications: Notification[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<number>();
  @Output() markAllAsRead = new EventEmitter<void>();
  @Output() deleteNotification = new EventEmitter<number>();

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

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
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

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}