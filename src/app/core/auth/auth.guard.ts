import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    if (authService.isAccessTokenExpired()) {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        return authService.refreshToken(refreshToken).pipe(
          map(() => true),
          catchError(() => {
            authService.signOut();
            router.navigate(['/sign-in']);
            return of(false);
          })
        );
      } else {
        authService.signOut();
        router.navigate(['/sign-in']);
        return false;
      }
    } else {
      return true;
    }
  } else {
    router.navigate(['/sign-in']);
    return false;
  }
};
