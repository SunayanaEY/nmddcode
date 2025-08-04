import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token might be expired or invalid
        authService.logout();
        router.navigate(['/login']);
      } else if (error.status === 403) {
        // Forbidden - user doesn't have permission
        console.error('Access forbidden:', error.message);
      } else if (error.status === 0) {
        // Network error or CORS issue
        console.error('Network error or CORS issue:', error.message);
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};