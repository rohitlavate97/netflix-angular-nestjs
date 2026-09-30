import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  Subject,
  asyncScheduler,
  catchError,
  concatMap,
  map,
  of,
  tap,
  throttleTime,
} from 'rxjs';
import {
  ReportWatchProgressDto,
  ContinueWatchingItemDto,
  ContinueWatchingResponseDto,
  WatchHistoryItemDto,
  WatchHistoryResponseDto,
  ResumePlaybackDto,
} from '@netflix/shared-types';
import { ProfileService } from './profile.service';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class WatchHistoryService {
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(ProfileService);
  private readonly apiUrl = 'http://localhost:3000/api/v1';

  readonly continueWatchingList = signal<ContinueWatchingItemDto[]>([]);
  readonly watchHistoryList = signal<WatchHistoryItemDto[]>([]);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  private readonly progressSubject = new Subject<ReportWatchProgressDto>();

  constructor() {
    // Throttled playback progress reporting to avoid spamming the backend
    this.progressSubject
      .pipe(
        throttleTime(5000, asyncScheduler, { leading: true, trailing: true }),
        concatMap((dto) =>
          this.sendProgressHttp(dto).pipe(
            catchError((err) => {
              console.warn('[WatchHistoryService] Throttled progress report failed:', err);
              return of(null);
            }),
          ),
        ),
      )
      .subscribe();
  }

  loadContinueWatching(profileId?: string): Observable<ContinueWatchingItemDto[]> {
    const pId = profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';

    this.isLoading.set(true);
    this.hasError.set(false);

    const params = new HttpParams().set('profileId', pId);

    return this.http
      .get<ApiEnvelope<ContinueWatchingResponseDto>>(
        `${this.apiUrl}/watch-history/continue-watching`,
        { params },
      )
      .pipe(
        map((res) => res.data?.items || []),
        tap((items) => {
          this.continueWatchingList.set(items);
          this.saveContinueWatchingToStorage(pId, items);
          this.isLoading.set(false);
        }),
        catchError(() => {
          // Fallback to local storage or initial demo state
          const stored = this.loadContinueWatchingFromStorage(pId);
          if (stored.length > 0) {
            this.continueWatchingList.set(stored);
          } else {
            const initialDemo = this.getInitialContinueWatching(pId);
            this.continueWatchingList.set(initialDemo);
            this.saveContinueWatchingToStorage(pId, initialDemo);
          }
          this.isLoading.set(false);
          return of(this.continueWatchingList());
        }),
      );
  }

  loadWatchHistory(
    profileId?: string,
    page = 1,
    limit = 20,
  ): Observable<WatchHistoryResponseDto> {
    const pId = profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';

    this.isLoading.set(true);
    this.hasError.set(false);

    const params = new HttpParams()
      .set('profileId', pId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http
      .get<ApiEnvelope<WatchHistoryResponseDto>>(`${this.apiUrl}/watch-history`, { params })
      .pipe(
        map((res) => res.data),
        tap((data) => {
          this.watchHistoryList.set(data.items);
          this.isLoading.set(false);
        }),
        catchError(() => {
          this.isLoading.set(false);
          const fallbackHistory: WatchHistoryResponseDto = {
            items: this.continueWatchingList().map((c) => ({
              id: c.id,
              profileId: c.profileId,
              movieId: c.movieId,
              episodeId: c.episodeId,
              positionSeconds: c.positionSeconds,
              durationSeconds: c.durationSeconds,
              progressPercentage: c.progressPercentage,
              completed: c.completed,
              lastWatchedAt: c.lastWatchedAt,
              createdAt: c.lastWatchedAt,
              updatedAt: c.lastWatchedAt,
            })),
            total: this.continueWatchingList().length,
            page: 1,
            limit: 20,
            totalPages: 1,
          };
          this.watchHistoryList.set(fallbackHistory.items);
          return of(fallbackHistory);
        }),
      );
  }

  reportProgress(dto: ReportWatchProgressDto): void {
    const pId = dto.profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';
    const contentKey = dto.movieId || dto.episodeId || '';

    // Calculate optimistic percentages
    const duration = Math.max(1, dto.durationSeconds);
    const progressPercentage = Math.min(
      100,
      Math.round(((dto.positionSeconds / duration) * 100) * 100) / 100,
    );
    const completed = dto.completed === true || progressPercentage >= 95;

    // Optimistically update localStorage
    this.saveProgressToStorage(pId, contentKey, {
      contentId: contentKey,
      positionSeconds: dto.positionSeconds,
      durationSeconds: dto.durationSeconds,
      progressPercentage,
      completed,
      lastWatchedAt: new Date().toISOString(),
      episodeId: dto.episodeId,
    });

    // Optimistically update continue watching list
    this.continueWatchingList.update((current) => {
      const idx = current.findIndex(
        (c) => c.movieId === contentKey || c.episodeId === contentKey || c.contentId === contentKey,
      );
      if (completed) {
        // If completed, remove from continue watching
        return current.filter((_, i) => i !== idx);
      }
      if (idx >= 0) {
        const updated = [...current];
        const remainingMinutes = Math.max(0, Math.round((duration - dto.positionSeconds) / 60));
        updated[idx] = {
          ...updated[idx],
          positionSeconds: dto.positionSeconds,
          durationSeconds: dto.durationSeconds,
          progressPercentage,
          remainingMinutes,
          lastWatchedAt: new Date().toISOString(),
        };
        return updated;
      }
      return current;
    });

    // Queue for throttled HTTP transmission
    this.progressSubject.next(dto);
  }

  reportProgressImmediate(dto: ReportWatchProgressDto): Observable<boolean> {
    return this.sendProgressHttp(dto).pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  getResumePlayback(
    profileId: string,
    contentId: string,
    isSeries = false,
    episodeId?: string,
  ): Observable<ResumePlaybackDto> {
    const targetKey = isSeries && episodeId ? episodeId : contentId;

    // Check localStorage first for instant response
    const cached = this.loadProgressFromStorage(profileId, targetKey);

    let params = new HttpParams().set('profileId', profileId);
    if (isSeries && episodeId) {
      params = params.set('episodeId', episodeId);
    } else {
      params = params.set('movieId', contentId);
    }

    return this.http
      .get<ApiEnvelope<ResumePlaybackDto>>(`${this.apiUrl}/watch-history/resume`, { params })
      .pipe(
        map((res) => res.data),
        tap((data) => {
          this.saveProgressToStorage(profileId, targetKey, data);
        }),
        catchError(() => {
          if (cached) {
            return of(cached);
          }
          return of({
            contentId: targetKey,
            positionSeconds: 0,
            durationSeconds: 0,
            progressPercentage: 0,
            completed: false,
          });
        }),
      );
  }

  removeFromHistory(id: string, profileId?: string): Observable<boolean> {
    const pId = profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';

    // Optimistic UI updates
    this.continueWatchingList.update((items) => items.filter((i) => i.id !== id));
    this.watchHistoryList.update((items) => items.filter((i) => i.id !== id));
    this.saveContinueWatchingToStorage(pId, this.continueWatchingList());

    const params = new HttpParams().set('profileId', pId);

    return this.http
      .delete<ApiEnvelope<void>>(`${this.apiUrl}/watch-history/${id}`, { params })
      .pipe(
        map(() => true),
        catchError(() => of(true)),
      );
  }

  clearHistory(profileId?: string): Observable<boolean> {
    const pId = profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';

    this.continueWatchingList.set([]);
    this.watchHistoryList.set([]);
    this.clearStorageForProfile(pId);

    return this.http
      .delete<ApiEnvelope<void>>(`${this.apiUrl}/watch-history/profile/${pId}`)
      .pipe(
        map(() => true),
        catchError(() => of(true)),
      );
  }

  private sendProgressHttp(dto: ReportWatchProgressDto): Observable<unknown> {
    return this.http.post<ApiEnvelope<WatchHistoryItemDto>>(
      `${this.apiUrl}/watch-history/progress`,
      dto,
    );
  }

  // Local storage caching helpers
  private saveContinueWatchingToStorage(profileId: string, items: ContinueWatchingItemDto[]): void {
    try {
      localStorage.setItem(`streamflix_continue_${profileId}`, JSON.stringify(items));
    } catch {
      // Storage unavailable / quota exceeded
    }
  }

  private loadContinueWatchingFromStorage(profileId: string): ContinueWatchingItemDto[] {
    try {
      const data = localStorage.getItem(`streamflix_continue_${profileId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveProgressToStorage(
    profileId: string,
    contentId: string,
    data: ResumePlaybackDto,
  ): void {
    try {
      localStorage.setItem(
        `streamflix_progress_${profileId}_${contentId}`,
        JSON.stringify(data),
      );
    } catch {
      // Storage unavailable
    }
  }

  private loadProgressFromStorage(
    profileId: string,
    contentId: string,
  ): ResumePlaybackDto | null {
    try {
      const data = localStorage.getItem(`streamflix_progress_${profileId}_${contentId}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private clearStorageForProfile(profileId: string): void {
    try {
      localStorage.removeItem(`streamflix_continue_${profileId}`);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`streamflix_progress_${profileId}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Storage unavailable
    }
  }

  private getInitialContinueWatching(profileId: string): ContinueWatchingItemDto[] {
    return [
      {
        id: 'demo-cw-1',
        profileId,
        contentId: 'movie-1',
        title: 'Shadow Protocol',
        description: 'A rogue cyber operative uncovers a global surveillance conspiracy.',
        posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1280&auto=format&fit=crop&q=80',
        isSeries: false,
        movieId: 'movie-1',
        positionSeconds: 3840,
        durationSeconds: 7200,
        progressPercentage: 53.33,
        remainingMinutes: 56,
        completed: false,
        lastWatchedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'demo-cw-2',
        profileId,
        contentId: 'series-1',
        title: 'Stranger Dimensions',
        subtitle: 'S1:E3 Into the Void',
        description: 'When a boy vanishes, a small town uncovers a supernatural mystery.',
        posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1280&auto=format&fit=crop&q=80',
        isSeries: true,
        seriesId: 'series-1',
        seasonNumber: 1,
        episodeNumber: 3,
        episodeId: 'ep-3',
        positionSeconds: 1620,
        durationSeconds: 3000,
        progressPercentage: 54.0,
        remainingMinutes: 23,
        completed: false,
        lastWatchedAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'demo-cw-3',
        profileId,
        contentId: 'movie-2',
        title: 'The Silent Sea',
        description: 'Space explorers attempt to retrieve samples from an abandoned lunar base.',
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=500&auto=format&fit=crop&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1280&auto=format&fit=crop&q=80',
        isSeries: false,
        movieId: 'movie-2',
        positionSeconds: 5200,
        durationSeconds: 6600,
        progressPercentage: 78.79,
        remainingMinutes: 23,
        completed: false,
        lastWatchedAt: new Date(Date.now() - 14400000).toISOString(),
      },
    ];
  }
}
