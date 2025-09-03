import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const JwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  console.log('JWT Interceptor: Processing request to:', req.url);
  
  // Check if user is logged in (this will also check for session expiry)
  if (!authService.isLoggedIn()) {
    console.log('JWT Interceptor: User not logged in, proceeding without token for:', req.url);
    return next(req);
  }
  
  // Get the current user from auth service
  const currentUser = authService.getUser();
  console.log('JWT Interceptor: Current user for request:', req.url, currentUser);
  
  // If user is logged in and has authData (JWT token), add it to the request
  if (currentUser && currentUser.authData) {
    console.log('JWT Interceptor: Adding Authorization header for request to:', req.url);
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.authData}`
      }
    });
    console.log('JWT Interceptor: Request headers after adding auth:', authReq.headers.keys());
    return next(authReq);
  } else {
    console.log('JWT Interceptor: User logged in but no authData found for:', req.url, currentUser);
  }

  console.log('JWT Interceptor: Proceeding without token for:', req.url);
  return next(req);
};