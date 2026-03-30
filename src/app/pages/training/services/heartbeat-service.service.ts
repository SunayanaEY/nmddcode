import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HeartbeatService implements OnDestroy {
  private heartbeatInterval = 60 * 1000;
  private subscription?: Subscription;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  startHeartbeat() {
    this.stopHeartbeat();
    this.sendHeartbeat();
    this.subscription = interval(this.heartbeatInterval).subscribe(() => {
      this.sendHeartbeat();
    });
  }

  stopHeartbeat() {
    this.subscription?.unsubscribe();
    this.subscription = undefined;
  }

  private sendHeartbeat() {
    this.http
      .post(
        `${this.apiUrl}api/auth/heartbeat`,
        {}
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
