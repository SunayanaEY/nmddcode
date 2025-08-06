import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}api/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response && response.data) {
          sessionStorage.setItem('user', JSON.stringify(response.data));
          this.user = response.data;
        }
      }),
      catchError(error => {
        console.error('Login failed', error);
        throw error;
      })
    );
  }

  logout() {
    this.user = null;
    sessionStorage.removeItem('user');
  }

  getUser() {
    if (!this.user) {
      const user = sessionStorage.getItem('user');
      this.user = user ? JSON.parse(user) : null;
    }
    return this.user;
  }

  isLoggedIn() {
    return !!sessionStorage.getItem('user');
  }

  register(formData: FormData): Observable<RegisterResponse> {
    // Explicitly set headers to let browser handle multipart/form-data
    const headers = new HttpHeaders();
    // Do NOT set Content-Type - let browser set it automatically for FormData
    
    return this.http.post<RegisterResponse>(`${this.apiUrl}api/auth/registerInstitute`, formData, {
      headers: headers
    }).pipe(
      catchError(error => {
        console.error('Registration failed', error);
        throw error;
      })
    );
  }
}