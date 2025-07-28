import { Injectable } from '@angular/core';
import { TrainingService } from '../pages/training/services/training.service';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: any = null;

  constructor(private trainingService: TrainingService) { }

  login(email: string, password: string): Observable<boolean> {
    return this.trainingService.login({ email, password }).pipe(
      tap(response => {
        if (response && response.data) {
          sessionStorage.setItem('user', JSON.stringify(response.data));
          this.user = response.data;
        }
      }),
      map(response => !!(response && response.data)),
      catchError(error => {
        console.error('Login failed', error);
        return of(false);
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