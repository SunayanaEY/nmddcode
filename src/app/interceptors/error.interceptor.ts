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
        // Check if this is a login or logout request - don't logout on these failures
        const isLoginRequest = req.url.includes('/auth/login') || req.url.includes('/login');
        const isLogoutRequest = req.url.includes('/auth/logout') || req.url.includes('/logout');
        
        if (!isLoginRequest && !isLogoutRequest) {
          // Unauthorized - token might be expired or invalid (but not a login/logout failure)
          authService.logoutSync(); // Use synchronous logout for automatic logout
          router.navigate(['/login']);
        }
        // For login/logout requests, let the component handle the error
      } else if (error.status === 403) {
        // Check if this is a logout request - don't logout on logout failures
        const isLogoutRequest = req.url.includes('/auth/logout') || req.url.includes('/logout');
        
        if (!isLogoutRequest) {
          // Forbidden - user doesn't have permission (but not a logout failure)
          console.error('Access forbidden:', error.message);
        } else {
          // Logout request failed - just log it, don't trigger another logout
          console.error('Logout API failed with 403:', error.message);
        }
      } else if (error.status === 0) {
        // Network error or CORS issue
        console.error('Network error or CORS issue:', error.message);
      }

      // Re-throw the error so components can handle it
      return throwError(() => error);
    })
  );
};