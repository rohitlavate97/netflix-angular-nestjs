import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import {
  WatchlistItemDto,
  WatchlistResponseDto,
  WatchlistContentType,
  ContentStatus,
} from '@netflix/shared-types';
import { ProfileService } from './profile.service';
import { ContentService } from './content.service';

@Injectable({
  providedIn: 'root',
})
export class WatchlistService {
  private readonly http = inject(HttpClient);
  private readonly profileService = inject(ProfileService);
  private readonly contentService = inject(ContentService);
  private readonly apiUrl = 'http://localhost:3000/api/v1';

  readonly watchlistItems = signal<WatchlistItemDto[]>([]);
  readonly isLoading = signal(false);
  readonly hasError = signal(false);

  readonly watchlistedContentIds = computed(() => {
    const ids = new Set<string>();
    for (const item of this.watchlistItems()) {
      if (item.movieId) ids.add(item.movieId);
      if (item.seriesId) ids.add(item.seriesId);
      ids.add(item.id);
    }
    return ids;
  });

  isWatchlisted(contentId: string): boolean {
    return this.watchlistedContentIds().has(contentId);
  }

  loadWatchlist(profileId?: string): Observable<WatchlistItemDto[]> {
    const pId = profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';

    this.isLoading.set(true);
    this.hasError.set(false);

    const params = new HttpParams().set('profileId', pId);

    return this.http.get<WatchlistResponseDto>(`${this.apiUrl}/watchlist`, { params }).pipe(
      map((res) => res.items),
      tap((items) => {
        this.watchlistItems.set(items);
        this.saveToStorage(pId, items);
        this.isLoading.set(false);
      }),
      catchError(() => {
        // Fallback to local storage or initial demo watchlist
        const stored = this.loadFromStorage(pId);
        if (stored.length > 0) {
          this.watchlistItems.set(stored);
        } else {
          const initialMock = this.buildDemoWatchlist(pId);
          this.watchlistItems.set(initialMock);
          this.saveToStorage(pId, initialMock);
        }
        this.isLoading.set(false);
        return of(this.watchlistItems());
      }),
    );
  }

  addToWatchlist(
    contentId: string,
    contentType: WatchlistContentType,
    profileId?: string,
  ): Observable<WatchlistItemDto> {
    const pId = profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';

    // Optimistic item creation
    const tempItem = this.createMockWatchlistItem(pId, contentId, contentType);
    this.watchlistItems.update((items) => {
      if (items.some((i) => i.movieId === contentId || i.seriesId === contentId || i.id === contentId)) {
        return items;
      }
      return [tempItem, ...items];
    });
    this.saveToStorage(pId, this.watchlistItems());

    return this.http
      .post<WatchlistItemDto>(`${this.apiUrl}/watchlist`, {
        profileId: pId,
        contentId,
        contentType,
      })
      .pipe(
        tap((saved) => {
          this.watchlistItems.update((items) =>
            items.map((i) => (i.id === tempItem.id ? saved : i)),
          );
          this.saveToStorage(pId, this.watchlistItems());
        }),
        catchError(() => of(tempItem)),
      );
  }

  removeFromWatchlist(contentId: string, profileId?: string): Observable<boolean> {
    const pId = profileId || this.profileService.currentProfile()?.id || 'demo-profile-1';

    // Optimistic removal
    this.watchlistItems.update((items) =>
      items.filter(
        (i) => i.movieId !== contentId && i.seriesId !== contentId && i.id !== contentId,
      ),
    );
    this.saveToStorage(pId, this.watchlistItems());

    return this.http
      .delete<{ success: boolean }>(`${this.apiUrl}/watchlist/${pId}/${contentId}`)
      .pipe(
        map(() => true),
        catchError(() => of(true)),
      );
  }

  toggleWatchlist(
    contentId: string,
    contentType: WatchlistContentType = 'movie',
    profileId?: string,
  ): Observable<boolean> {
    if (this.isWatchlisted(contentId)) {
      return this.removeFromWatchlist(contentId, profileId);
    }
    return this.addToWatchlist(contentId, contentType, profileId).pipe(map(() => true));
  }

  private saveToStorage(profileId: string, items: WatchlistItemDto[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`streamflix_watchlist_${profileId}`, JSON.stringify(items));
      } catch {
        // Ignore storage error
      }
    }
  }

  private loadFromStorage(profileId: string): WatchlistItemDto[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(`streamflix_watchlist_${profileId}`);
        if (raw) return JSON.parse(raw) as WatchlistItemDto[];
      } catch {
        return [];
      }
    }
    return [];
  }

  private buildDemoWatchlist(profileId: string): WatchlistItemDto[] {
    return [
      {
        id: 'w-demo-1',
        profileId,
        movieId: 'movie-1',
        createdAt: new Date().toISOString(),
        movie: {
          id: 'movie-1',
          title: 'Shadow Protocol',
          slug: 'shadow-protocol',
          description: 'An elite cyber-intelligence operative uncovers a global conspiracy.',
          releaseDate: '2025-11-12',
          durationMinutes: 128,
          ageRating: '16+',
          language: 'English',
          country: 'United States',
          posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
          backdropUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
          genres: [{ id: 'g1', name: 'Action', slug: 'action' }, { id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }],
          status: 'PUBLISHED' as ContentStatus,
          viewCount: 1420500,
          averageRating: 4.8,
        },
      },
      {
        id: 'w-demo-2',
        profileId,
        seriesId: 'series-1',
        createdAt: new Date().toISOString(),
        series: {
          id: 'series-1',
          title: 'The Neural Grid',
          slug: 'the-neural-grid',
          description: 'A multi-generational saga exploring humanity fusion with machine intelligence.',
          releaseDate: '2024-03-01',
          ageRating: '18+',
          language: 'English',
          posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
          backdropUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
          genres: [{ id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }],
          status: 'PUBLISHED' as ContentStatus,
          seasons: [],
          averageRating: 4.8,
        },
      },
    ];
  }

  private createMockWatchlistItem(
    profileId: string,
    contentId: string,
    contentType: WatchlistContentType,
  ): WatchlistItemDto {
    return {
      id: `w-opt-${Date.now()}`,
      profileId,
      movieId: contentType === 'movie' ? contentId : undefined,
      seriesId: contentType === 'series' ? contentId : undefined,
      createdAt: new Date().toISOString(),
    };
  }
}
