import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  
  // Special handling for logout requests - check session storage directly to avoid circular dependency
  if (req.url.includes('/logout')) {
    const userFromStorage = sessionStorage.getItem('user');
    if (userFromStorage) {
      try {
        const user = JSON.parse(userFromStorage);
        if (user && user.authData) {
          const authReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${user.authData}`
            }
          });
          return next(authReq);
        }
      } catch (error) {
        console.error('JWT Interceptor: Error parsing user from session storage:', error);
      }
    }
    return next(req);
  }
  
  // For non-logout requests, use the normal flow
  // Check if user is logged in (this will also check for session expiry)
  if (!authService.isLoggedIn()) {
    return next(req);
  }
  
  // Get the current user from auth service
  const currentUser = authService.getUser();
  
  // If user is logged in and has authData (JWT token), add it to the request
  if (currentUser && currentUser.authData) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.authData}`
      }
    });
    return next(authReq);
  } else {
    console.log('JWT Interceptor: User logged in but no authData found for:', req.url, currentUser);
  }

  return next(req);
};