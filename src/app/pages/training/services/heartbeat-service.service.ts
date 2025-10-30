import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService implements OnDestroy {
  private heartbeatInterval = 0.5 * 60 * 1000;
  private subscription?: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  startHeartbeat() {
    // Send immediately and then every 2 minutes
    this.sendHeartbeat();
    this.subscription = interval(this.heartbeatInterval).subscribe(() => {
      this.sendHeartbeat();
    });
  }

  stopHeartbeat() {
    this.subscription?.unsubscribe();
  }

  private sendHeartbeat() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    this.http
      .post(
        `${this.apiUrl}api/auth/heartbeat`,
        {},
        {
          headers: { Authorization: token },
        }
      )
      .subscribe({
        next: () => console.log('Heartbeat sent'),
        error: (err) => console.error('Heartbeat failed', err),
      });
  }

  ngOnDestroy() {
    this.stopHeartbeat();
  }
}
