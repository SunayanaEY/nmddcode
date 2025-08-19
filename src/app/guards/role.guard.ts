import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Get allowed roles from route data
  const allowedRoles = route.data?.['allowedRoles'] as number[];
  
  if (!allowedRoles || allowedRoles.length === 0) {
    // If no roles specified, allow access
    return true;
  }

  // Check if user's role is in the allowed roles
  if (allowedRoles.includes(user.role)) {
    return true;
  } else {
    // Redirect to unauthorized page
    router.navigate(['/unauthorized']);
    return false;
  }
};