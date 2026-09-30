import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import {
  UserProfileDto,
  CreateProfileDto,
  UpdateProfileDto,
  SelectProfileResponse,
  DEFAULT_PROFILE_AVATARS,
} from '@netflix/shared-types';

const CURRENT_PROFILE_KEY = 'streamflix_current_profile';

const AVATAR_RED = 'https://assets.streamflix.local/avatars/netflix-avatar-red.png';
const AVATAR_BLUE = 'https://assets.streamflix.local/avatars/netflix-avatar-blue.png';
const AVATAR_KIDS = 'https://assets.streamflix.local/avatars/netflix-avatar-kids.png';

export const DEMO_PROFILES: UserProfileDto[] = [
  {
    id: 'demo-profile-1',
    userId: 'demo-user-id',
    name: 'Rohit',
    avatarUrl: (typeof DEFAULT_PROFILE_AVATARS !== 'undefined' && DEFAULT_PROFILE_AVATARS[0]) || AVATAR_RED,
    isKids: false,
    maturityRating: '18+',
    language: 'en',
    hasPin: false,
    autoplayNext: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-profile-2',
    userId: 'demo-user-id',
    name: 'Kids Club',
    avatarUrl: (typeof DEFAULT_PROFILE_AVATARS !== 'undefined' && DEFAULT_PROFILE_AVATARS[4]) || AVATAR_KIDS,
    isKids: true,
    maturityRating: '7+',
    language: 'en',
    hasPin: false,
    autoplayNext: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'demo-profile-3',
    userId: 'demo-user-id',
    name: 'Family Lounge',
    avatarUrl: (typeof DEFAULT_PROFILE_AVATARS !== 'undefined' && DEFAULT_PROFILE_AVATARS[1]) || AVATAR_BLUE,
    isKids: false,
    maturityRating: '13+',
    language: 'en',
    hasPin: true,
    autoplayNext: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1/profiles';

  readonly profiles = signal<UserProfileDto[]>(DEMO_PROFILES);
  readonly currentProfile = signal<UserProfileDto | null>(this.getStoredProfile() ?? DEMO_PROFILES[0]);
  readonly isLoading = signal<boolean>(false);

  readonly isKidsMode = computed(() => this.currentProfile()?.isKids ?? false);
  readonly hasSelectedProfile = computed(() => !!this.currentProfile());

  loadProfiles(): Observable<UserProfileDto[]> {
    this.isLoading.set(true);
    return this.http.get<UserProfileDto[]>(this.apiUrl).pipe(
      tap((data) => {
        this.isLoading.set(false);
        if (data && data.length > 0) {
          this.profiles.set(data);
          // If stored profile is not in new list, pick the first
          const current = this.currentProfile();
          if (current && !data.some((p) => p.id === current.id)) {
            this.selectProfile(data[0]);
          }
        }
      }),
      catchError((_err) => {
        this.isLoading.set(false);
        // Fallback to demo profiles if network or auth error
        this.profiles.set(DEMO_PROFILES);
        return of(DEMO_PROFILES);
      })
    );
  }

  selectProfile(profile: UserProfileDto, pin?: string): Observable<SelectProfileResponse> {
    this.isLoading.set(true);
    return this.http
      .post<SelectProfileResponse>(`${this.apiUrl}/${profile.id}/select`, { pin })
      .pipe(
        tap((res) => {
          this.isLoading.set(false);
          this.setCurrentProfile(res.profile);
        }),
        catchError((err) => {
          this.isLoading.set(false);
          // If offline/demo mode, allow direct selection if pin not required or dummy pin
          if (!profile.hasPin || pin) {
            this.setCurrentProfile(profile);
            return of({
              profile,
              selectedAt: new Date().toISOString(),
            });
          }
          return throwError(() => err);
        })
      );
  }

  createProfile(dto: CreateProfileDto): Observable<UserProfileDto> {
    this.isLoading.set(true);
    return this.http.post<UserProfileDto>(this.apiUrl, dto).pipe(
      tap((newProfile) => {
        this.isLoading.set(false);
        this.profiles.update((list) => [...list, newProfile]);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  updateProfile(id: string, dto: UpdateProfileDto): Observable<UserProfileDto> {
    this.isLoading.set(true);
    return this.http.patch<UserProfileDto>(`${this.apiUrl}/${id}`, dto).pipe(
      tap((updated) => {
        this.isLoading.set(false);
        this.profiles.update((list) => list.map((p) => (p.id === id ? updated : p)));
        if (this.currentProfile()?.id === id) {
          this.setCurrentProfile(updated);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  deleteProfile(id: string): Observable<void> {
    this.isLoading.set(true);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.isLoading.set(false);
        this.profiles.update((list) => list.filter((p) => p.id !== id));
        if (this.currentProfile()?.id === id) {
          const remaining = this.profiles();
          this.setCurrentProfile(remaining.length > 0 ? remaining[0] : null);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        return throwError(() => err);
      })
    );
  }

  setCurrentProfile(profile: UserProfileDto | null): void {
    this.currentProfile.set(profile);
    if (typeof window !== 'undefined') {
      try {
        if (profile) {
          localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(profile));
        } else {
          localStorage.removeItem(CURRENT_PROFILE_KEY);
        }
      } catch {
        // storage unavailable
      }
    }
  }

  private getStoredProfile(): UserProfileDto | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(CURRENT_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
