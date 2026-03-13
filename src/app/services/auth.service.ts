import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, interval, Subscription } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HeartbeatService } from '../pages/training/services/heartbeat-service.service';

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
  private isLoggingOut: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngbModal: NgbModal,
    private heartbeatService: HeartbeatService
  ) {
    this.setupActivityListeners();
    if (this.isLoggedIn()) {
      this.startSessionMonitoring();
      this.heartbeatService.startHeartbeat();
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}api/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          if (response && response.data) {
            const loginTime = Date.now();
            console.log('Rsponse login : ' + JSON.stringify(response.data));
            sessionStorage.setItem('user', JSON.stringify(response.data));
            sessionStorage.setItem('loginTime', loginTime.toString());
            this.user = response.data;
            this.lastActivityTime = loginTime;
            this.startSessionMonitoring();
            this.heartbeatService.startHeartbeat();
          }
        }),
        catchError((error) => {
          console.error('Login failed', error);
          throw error;
        })
      );
  }

  logout(): Observable<any> {
    // Call logout API to invalidate session on server
    return this.http.post(`${this.apiUrl}api/auth/logout`, {}).pipe(
      tap(() => {
        // console.log('Logout API called successfully');
      }),
      catchError((error) => {
        console.error('Logout API failed', error);
        // Continue with local logout even if API fails
        return of(null);
      }),
      tap(() => {
        this.clearSessionData();
      })
    );
  }

  // Synchronous logout for cases where we don't need to wait for API response
  logoutSync(): void {
    // Prevent multiple logout attempts
    if (this.isLoggingOut) {
      console.log('Logout already in progress, skipping...');
      return;
    }

    this.isLoggingOut = true;

    // Call logout API and clear session data only after successful response
    this.http
      .post(`${this.apiUrl}api/auth/logout`, {})
      .pipe(
        catchError((error) => {
          console.error('Logout API failed', error);
          // Clear session data even if API fails
          this.clearSessionData();
          this.isLoggingOut = false;
          return of(null);
        })
      )
      .subscribe({
        next: (response) => {
          // Only clear session data after successful API response
          this.clearSessionData();
          this.isLoggingOut = false;
        },
      });
  }

  private clearSessionData(): void {
    this.user = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTime');
    localStorage.removeItem('authToken');
    this.stopSessionMonitoring();
    this.heartbeatService.stopHeartbeat();
    this.closeAllOpenModals();
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
  updateInstitute(
    trainingInstituteId: any,
    instituteDetails: any
  ): Observable<RegisterResponse> {
    return this.http
      .put<RegisterResponse>(
        `${this.apiUrl}trainingInstitutes/updateByState/${trainingInstituteId}`,
        instituteDetails, // plain JSON body
        {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Update failed', error);
          throw error;
        })
      );
  }

  createInstitute(
    userId: any,
    formData: FormData
  ): Observable<RegisterResponse> {
    // Explicitly set headers to let browser handle multipart/form-data
    const headers = new HttpHeaders();
    // Do NOT set Content-Type - let browser set it automatically for FormData

    return this.http
      .post<RegisterResponse>(
        `${this.apiUrl}trainingInstitutes/create/${userId}`,
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
  createOrganization(organizationData: any): Observable<any> {
    const headers = new HttpHeaders();
    return this.http
      .post<RegisterResponse>(
        `${this.apiUrl}organization/save`,
        organizationData,
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
  updateOrganization(id: any, organizationData: any): Observable<any> {
    const headers = new HttpHeaders();
    return this.http
      .put<RegisterResponse>(
        `${this.apiUrl}organization/update/${id}`,
        organizationData,
        {
          headers: headers,
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Updation failed', error);
          throw error;
        })
      );
  }

  checkOrganizationCode(
    organizationCode: string
  ): Observable<{ organizationCode: string; exists: boolean; message: string }> {
    return this.http
      .get<{ organizationCode: string; exists: boolean; message: string }>(
        `${this.apiUrl}organization/check-orgcode`,
        {
          params: { organizationCode },
        }
      )
      .pipe(
        catchError((error) => {
          console.error('Organization code check failed', error);
          const message =
            (error && error.error && error.error.message) ||
            'Organization code validation failed';
          return of({
            organizationCode,
            exists: true,
            message,
          });
        })
      );
  }

  // Session timeout management methods
  private startSessionMonitoring(): void {
    this.stopSessionMonitoring(); // Stop any existing monitoring

    // Check session every minute
    this.sessionCheckInterval = interval(60000).subscribe(() => {
      // Only check for session expiry if user is logged in
      if (this.isLoggedIn() && this.isSessionExpired()) {
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
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      document.addEventListener(
        event,
        () => {
          if (this.isLoggedIn()) {
            this.updateLastActivity();
          }
        },
        true
      );
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
    // Prevent multiple logout attempts
    if (this.isLoggingOut) {
      return;
    }

    // Additional safety check: only handle session expiry if user data exists in session storage
    // Use direct session storage check to avoid circular dependency with isLoggedIn()
    if (!sessionStorage.getItem('user')) {
      return;
    }

    // Close any open modals before navigating to login
    this.closeAllOpenModals();

    this.logoutSync(); // Use synchronous logout for automatic logout
    this.router.navigate(['/login'], {
      queryParams: {
        message:
          'Your session has expired due to inactivity. Please log in again.',
      },
    });
  }

  // Method to get remaining session time (useful for displaying countdown)
  getRemainingSessionTime(): number {
    // Use direct session storage check to avoid potential circular dependency
    if (!sessionStorage.getItem('user')) {
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

  /**
   * Close all open modals across the app (ng-bootstrap and native Bootstrap)
   */
  private closeAllOpenModals(): void {
    // Try closing any ng-bootstrap modals
    try {
      this.ngbModal.dismissAll();
    } catch (e) {}

    // Close any native Bootstrap modals currently shown
    try {
      const w: any = window as any;
      const openModals = document.querySelectorAll<HTMLElement>('.modal.show');
      openModals.forEach((el) => {
        try {
          const ModalCtor = w?.bootstrap?.Modal;
          if (ModalCtor) {
            let instance = ModalCtor.getInstance(el);
            if (!instance) {
              instance = new ModalCtor(el);
            }
            instance.hide();
          } else {
            // Fallback: force-hide element
            el.classList.remove('show');
            el.style.display = 'none';
            el.setAttribute('aria-hidden', 'true');
          }
        } catch (_) {
          // ignore individual modal errors
        }
      });

      // Remove any lingering backdrops and body classes
      document.querySelectorAll('.modal-backdrop').forEach((bd) => bd.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('padding-right');
    } catch (_) {
      // ignore
    }
  }
}
