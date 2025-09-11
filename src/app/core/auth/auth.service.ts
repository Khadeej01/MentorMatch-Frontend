import { Injectable } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';
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

  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getAuthData()?.user || null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  signIn(credentials: {email: string, password: string}): Observable<AuthResponse> {
    // Backend returns { token, user: { id, nom, email, role } }
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      // Map backend payload to our AuthResponse shape
      // Role mapping: APPRENANT->learner, MENTOR->mentor, ADMIN->admin
      // Name mapping: nom -> fullName
      // Token mapping: token -> accessToken
      tap((raw) => {
        const backendUser = raw?.user || {};
        const mappedRole = (backendUser.role || '').toString().toLowerCase() === 'apprenant'
          ? 'learner'
          : (backendUser.role || '').toString().toLowerCase();

        const response: AuthResponse = {
          accessToken: raw?.token || '',
          refreshToken: '',
          user: {
            id: String(backendUser.id ?? ''),
            email: backendUser.email ?? '',
            fullName: backendUser.nom ?? '',
            role: (['mentor','learner','admin'].includes(mappedRole) ? mappedRole : 'learner') as User['role']
          }
        };

        this.setAuthData(response);
        this.currentUserSubject.next(response.user);
      })
    ) as unknown as Observable<AuthResponse>;
  }

    signUp(userData: { nom: string; email: string; password: string; role: 'mentor' | 'learner'; competences?: string; experience?: string; }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        this.setAuthData(res);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  // Raw sign up to allow role-specific extra fields
  signUpRaw(payload: Record<string, unknown>): Observable<{message: string}> {
    // Ensure role normalization if present
    if (typeof payload['role'] === 'string') {
      payload['role'] = (payload['role'] as string).toLowerCase();
    }
    return this.http.post<{message: string}>(`${this.apiUrl}/register`, payload);
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
      tap(res => {
        this.setAuthData(res);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  getUserProfile(): Observable<User> {
    // Simulate HTTP GET request to /me
    const authData = this.getAuthData();
    if (authData && authData.user) {
      return of(authData.user).pipe(delay(500)); // Return current user from stored data
    } else {
      return throwError(() => new Error('User not logged in.'));
    }
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
    this.currentUserSubject.next(null);
  }
}
