import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['expectedRole'];

  if (!authService.isLoggedIn()) {
    router.navigate(['/sign-in']);
    return false;
  }

  const userRole = authService.getUserRole();
  if (userRole !== expectedRole) {
    // Redirect to a 'not-authorized' page or home page
    router.navigate(['/']);
    return false;
  }

  return true;
};
