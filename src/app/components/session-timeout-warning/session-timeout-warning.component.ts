import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-session-timeout-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showWarning" class="session-warning-container">
      <div class="session-warning-content">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <h4>Session Expiring Soon</h4>
          <p>Your session will expire in {{ formatTime(remainingTime) }}</p>
          <p>Click anywhere to extend your session.</p>
        </div>
        <button class="extend-btn" (click)="extendSession()">Extend Session</button>
      </div>
    </div>
  `,
  styles: [`
    .session-warning-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .session-warning-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .warning-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .warning-text {
      flex: 1;
    }

    .warning-text h4 {
      margin: 0 0 8px 0;
      color: #856404;
      font-size: 16px;
      font-weight: 600;
    }

    .warning-text p {
      margin: 0 0 4px 0;
      color: #856404;
      font-size: 14px;
      line-height: 1.4;
    }

    .extend-btn {
      background: #ffc107;
      border: none;
      color: #212529;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 14px;
      margin-top: 8px;
      transition: background-color 0.2s;
    }

    .extend-btn:hover {
      background: #e0a800;
    }
  `]
})
export class SessionTimeoutWarningComponent implements OnInit, OnDestroy {
  remainingTime: number = 0;
  showWarning: boolean = false;
  private warningThreshold: number = 2 * 60 * 1000; // Show warning 2 minutes before expiry
  private updateInterval: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.startMonitoring();
  }

  ngOnDestroy(): void {
    this.stopMonitoring();
  }

  private startMonitoring(): void {
    // Update every 5 seconds
    this.updateInterval = interval(5000).subscribe(() => {
      this.updateRemainingTime();
    });
  }

  private stopMonitoring(): void {
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
      this.updateInterval = null;
    }
  }

  private updateRemainingTime(): void {
    if (!this.authService.isLoggedIn()) {
      this.showWarning = false;
      return;
    }

    this.remainingTime = this.authService.getRemainingSessionTime();
    this.showWarning = this.remainingTime > 0 && this.remainingTime <= this.warningThreshold;
  }

  extendSession(): void {
    this.authService.extendSession();
    this.showWarning = false;
  }

  formatTime(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}