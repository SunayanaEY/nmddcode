import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
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
  }

  return next(req);
};