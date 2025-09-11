import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Do NOT attach Authorization for auth endpoints
    const isAuthEndpoint = request.url.includes('/api/auth/');

    const accessToken = this.authService.getAccessToken();
    if (accessToken && !isAuthEndpoint) {
      request = this.addToken(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();
      if (refreshToken) {
        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((authResponse) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(authResponse.accessToken);
            return next.handle(this.addToken(request, authResponse.accessToken));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.authService.signOut();
            this.router.navigate(['/sign-in']);
            return throwError(() => err);
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.signOut();
        this.router.navigate(['/sign-in']);
        return throwError(() => new Error('No refresh token available.'));
      }
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => next.handle(this.addToken(request, token)))
      );
    }
  }
}
