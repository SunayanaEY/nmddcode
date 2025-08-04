import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}