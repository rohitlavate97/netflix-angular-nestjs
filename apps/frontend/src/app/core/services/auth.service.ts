import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { AuthResponse, UserRole } from '@netflix/shared-types';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
}

const ACCESS_TOKEN_KEY = 'streamflix_access_token';
const REFRESH_TOKEN_KEY = 'streamflix_refresh_token';
const USER_KEY = 'streamflix_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/auth';

  readonly currentUser = signal<UserSession | null>(this.getStoredUser());
  readonly accessToken = signal<string | null>(this.getStoredToken(ACCESS_TOKEN_KEY));
  readonly isLoading = signal<boolean>(false);

  readonly isAuthenticated = computed(() => !!this.accessToken() && !!this.currentUser());
  readonly isAdmin = computed(() => {
    const role = this.currentUser()?.role as string | undefined;
    return role === 'ADMIN';
  });
  readonly isContentManager = computed(() => {
    const role = this.currentUser()?.role as string | undefined;
    return role === 'ADMIN' || role === 'CONTENT_MANAGER';
  });

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        this.isLoading.set(false);
        this.saveSession(res);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  register(dto: { email: string; password: string }): Observable<AuthResponse> {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, dto).pipe(
      tap((res) => {
        this.isLoading.set(false);
        this.saveSession(res);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  refreshToken(): Observable<{ accessToken: string; expiresIn: number } | null> {
    const refreshToken = this.getStoredToken(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      this.logout();
      return of(null);
    }

    return this.http
      .post<{ accessToken: string; expiresIn: number }>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          this.setStoredToken(ACCESS_TOKEN_KEY, res.accessToken);
          this.accessToken.set(res.accessToken);
        }),
        catchError(() => {
          this.logout();
          return of(null);
        })
      );
  }

  logout(): void {
    const refreshToken = this.getStoredToken(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      this.http.post(`${this.apiUrl}/logout`, { refreshToken }).subscribe({
        error: () => {
          /* ignore network errors during logout */
        },
      });
    }

    this.clearStorage();
    this.currentUser.set(null);
    this.accessToken.set(null);
  }

  setDemoSession(): void {
    const demoUser: UserSession = {
      id: 'demo-user-id',
      email: 'demo@streamflix.local',
      role: 'USER' as UserRole,
      isEmailVerified: true,
    };
    const demoToken = 'demo-jwt-token-streamflix';
    this.setStoredToken(ACCESS_TOKEN_KEY, demoToken);
    this.setStoredToken(REFRESH_TOKEN_KEY, 'demo-refresh-token');
    this.setStoredItem(USER_KEY, JSON.stringify(demoUser));
    this.currentUser.set(demoUser);
    this.accessToken.set(demoToken);
  }

  private saveSession(res: AuthResponse): void {
    this.setStoredToken(ACCESS_TOKEN_KEY, res.tokens.accessToken);
    this.setStoredToken(REFRESH_TOKEN_KEY, res.tokens.refreshToken);
    this.setStoredItem(USER_KEY, JSON.stringify(res.user));
    this.accessToken.set(res.tokens.accessToken);
    this.currentUser.set(res.user);
  }

  private getStoredToken(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setStoredToken(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage unavailable
    }
  }

  private getStoredUser(): UserSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private setStoredItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // storage unavailable
    }
  }

  private clearStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // storage unavailable
    }
  }
}
