import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'mentor' | 'learner' | 'admin';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

const AUTH_DATA_KEY = 'auth-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth'; // Placeholder for your backend API URL

  constructor(private http: HttpClient) { }

  signIn(credentials: {email: string, password: string}): Observable<AuthResponse> {
    // Simulate HTTP POST request to /login
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.setAuthData(res))
    );
  }

  signUp(userData: {fullName: string, email: string, password: string, role: 'mentor' | 'learner'}): Observable<AuthResponse> {
    // Simulate HTTP POST request to /register
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => this.setAuthData(res))
    );
  }

  private setAuthData(data: AuthResponse): void {
    localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(data));
  }

  getAuthData(): AuthResponse | null {
    const data = localStorage.getItem(AUTH_DATA_KEY);
    return data ? JSON.parse(data) : null;
  }

  getAccessToken(): string | null {
    const authData = this.getAuthData();
    return authData ? authData.accessToken : null;
  }

  getRefreshToken(): string | null {
    const authData = this.getAuthData();
    return authData ? authData.refreshToken : null;
  }

  isAccessTokenExpired(): boolean {
    // This is a placeholder. In a real app, you would decode the JWT
    // and check its expiration date (exp claim).
    // For now, we'll just return false, assuming it never expires.
    return false;
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    // Simulate API call to refresh token
    console.log('AuthService.refreshToken called with:', refreshToken);
    const authData = this.getAuthData();
    if (!authData) {
      return throwError(() => new Error('No auth data found for refresh.'));
    }

    const newAccessToken = 'new-fake-access-token-' + authData.user.role;
    const newRefreshToken = 'new-fake-refresh-token-' + authData.user.role;

    const response: AuthResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: authData.user
    };

    return of(response).pipe(
      delay(500),
      tap(res => this.setAuthData(res))
    );
  }

  getUserRole(): 'mentor' | 'learner' | 'admin' | null {
    const data = this.getAuthData();
    return data ? data.user.role : null;
  }

  isLoggedIn(): boolean {
    return !!this.getAuthData();
  }

  signOut(): void {
    localStorage.removeItem(AUTH_DATA_KEY);
  }
}
