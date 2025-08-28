import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, interval, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface LoginResponse {
  data: {
    role: number;
    authData: string;
    id: number;
    email: string;
    username: string;
  };
  message: string;
  status: number;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    trainingInstituteName: string;
    roleId: number;
    scheme: string;
    state: string;
    district: string;
    block: string | null;
    registrationId: string;
    contactPersonName: string;
    designation: string;
    contactNumber: string;
    emailId: string;
    userId: number;
    instituteImageUrl: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
  };
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: any = null;
  private apiUrl = environment.apiUrl;
  private sessionTimeout = 10 * 60 * 1000; // 10 minutes in milliseconds
  private sessionCheckInterval: Subscription | null = null;
  private lastActivityTime: number = Date.now();

  constructor(private http: HttpClient, private router: Router) {
    this.startSessionMonitoring();
    this.setupActivityListeners();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}api/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response && response.data) {
          const loginTime = Date.now();
          sessionStorage.setItem('user', JSON.stringify(response.data));
          sessionStorage.setItem('loginTime', loginTime.toString());
          this.user = response.data;
          this.lastActivityTime = loginTime;
          this.startSessionMonitoring();
        }
      }),
      catchError(error => {
        console.error('Login failed', error);
        throw error;
      })
    return this.http
      .post<LoginResponse>(`${this.apiUrl}api/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response && response.data) {
            sessionStorage.setItem('user', JSON.stringify(response.data));
            this.user = response.data;
          }
        }),
        catchError((error) => {
          console.error('Login failed', error);
          throw error;
        })
      );
  }
  // login.service.ts

  changePassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Observable<any> {
    const body = {
      email: email,
      oldPassword: oldPassword,
      newPassword: newPassword,
    };

    return this.http.post<any>(this.apiUrl + 'api/auth/reset-password', body);
  }
  forgetPasswordOTP(email: string): Observable<any> {
    const body = {
      email: email,
    };
    return this.http.post<any>(this.apiUrl + 'api/auth/forgot-password', body);
  }
  forgetPassword(
    email: string,
    otp: number,
    newPassword: string
  ): Observable<any> {
    const body = {
      email: email,
      otp: otp,
      newPassword: newPassword,
    };
    return this.http.post<any>(
      this.apiUrl + 'api/auth/forgot-password-otp',
      body
    );
  }

  logout() {
    this.user = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTime');
    this.stopSessionMonitoring();
  }

  getUser() {
    if (!this.user) {
      const user = sessionStorage.getItem('user');
      this.user = user ? JSON.parse(user) : null;
    }
    return this.user;
  }

  isLoggedIn() {
    if (!sessionStorage.getItem('user')) {
      return false;
    }
    
    // Check if session has expired
    if (this.isSessionExpired()) {
      this.handleSessionExpiry();
      return false;
    }
    
    return true;
  }

  getUserRole(): number | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  hasRole(allowedRoles: number[]): boolean {
    const userRole = this.getUserRole();
    return userRole !== null && allowedRoles.includes(userRole);
  }

  isAdmin(): boolean {
    return this.getUserRole() === 1;
  }

  isTrainingHead(): boolean {
    return this.getUserRole() === 3;
  }

  isDataEntryOperator(): boolean {
    return this.getUserRole() === 4;
  }

  register(formData: FormData): Observable<RegisterResponse> {
    // Explicitly set headers to let browser handle multipart/form-data
    const headers = new HttpHeaders();
    // Do NOT set Content-Type - let browser set it automatically for FormData

    return this.http
      .post<RegisterResponse>(
        `${this.apiUrl}api/auth/registerInstitute`,
        formData,
        {
          headers: headers,
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Registration failed', error);
          throw error;
        })
      );
  }

  // Session timeout management methods
  private startSessionMonitoring(): void {
    this.stopSessionMonitoring(); // Stop any existing monitoring
    
    // Check session every minute
    this.sessionCheckInterval = interval(60000).subscribe(() => {
      if (this.isSessionExpired()) {
        this.handleSessionExpiry();
      }
    });
  }

  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      this.sessionCheckInterval.unsubscribe();
      this.sessionCheckInterval = null;
    }
  }

  private setupActivityListeners(): void {
    // Listen for user activity to update last activity time
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        if (this.isLoggedIn()) {
          this.updateLastActivity();
        }
      }, true);
    });
  }

  private updateLastActivity(): void {
    this.lastActivityTime = Date.now();
  }

  private isSessionExpired(): boolean {
    if (!sessionStorage.getItem('user')) {
      return true;
    }

    const loginTime = sessionStorage.getItem('loginTime');
    if (!loginTime) {
      return true;
    }

    const currentTime = Date.now();
    const timeSinceActivity = currentTime - this.lastActivityTime;
    
    return timeSinceActivity > this.sessionTimeout;
  }

  private handleSessionExpiry(): void {
    console.log('Session expired due to inactivity');
    this.logout();
    this.router.navigate(['/login'], { 
      queryParams: { message: 'Your session has expired due to inactivity. Please log in again.' }
    });
  }

  // Method to get remaining session time (useful for displaying countdown)
  getRemainingSessionTime(): number {
    if (!this.isLoggedIn()) {
      return 0;
    }

    const timeSinceActivity = Date.now() - this.lastActivityTime;
    const remainingTime = this.sessionTimeout - timeSinceActivity;
    
    return Math.max(0, remainingTime);
  }

  // Method to extend session (reset activity time)
  extendSession(): void {
    if (this.isLoggedIn()) {
      this.updateLastActivity();
    }
  }
}