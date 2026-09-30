import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WatchlistService } from '../../core/services/watchlist.service';
import { ProfileService } from '../../core/services/profile.service';
import { WatchlistItemDto } from '@netflix/shared-types';
import {
  ContentCardComponent,
  CardContentItem,
} from '../../shared/components/content-card/content-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [
    CommonModule,
    ContentCardComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="min-h-screen pt-24 pb-20 px-4 md:px-12 text-white bg-[#141414] select-none">
      <!-- Header Section -->
      <section class="max-w-7xl mx-auto mb-8 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              My List
            </h1>
            <p class="text-xs sm:text-sm text-zinc-400 mt-1">
              Titles you've saved to watch on {{ profileName() }}
            </p>
          </div>

          <!-- Controls: Content Type Chips & Sorting -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Filter Chips -->
            <div class="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-full text-xs">
              <button
                type="button"
                (click)="setFilter('all')"
                [class.bg-zinc-700]="selectedFilter() === 'all'"
                [class.text-white]="selectedFilter() === 'all'"
                [class.font-bold]="selectedFilter() === 'all'"
                [class.text-zinc-400]="selectedFilter() !== 'all'"
                class="px-3.5 py-1 rounded-full transition-colors hover:text-white"
              >
                All ({{ totalCount() }})
              </button>
              <button
                type="button"
                (click)="setFilter('movie')"
                [class.bg-zinc-700]="selectedFilter() === 'movie'"
                [class.text-white]="selectedFilter() === 'movie'"
                [class.font-bold]="selectedFilter() === 'movie'"
                [class.text-zinc-400]="selectedFilter() !== 'movie'"
                class="px-3.5 py-1 rounded-full transition-colors hover:text-white"
              >
                Movies ({{ movieCount() }})
              </button>
              <button
                type="button"
                (click)="setFilter('series')"
                [class.bg-zinc-700]="selectedFilter() === 'series'"
                [class.text-white]="selectedFilter() === 'series'"
                [class.font-bold]="selectedFilter() === 'series'"
                [class.text-zinc-400]="selectedFilter() !== 'series'"
                class="px-3.5 py-1 rounded-full transition-colors hover:text-white"
              >
                TV Series ({{ seriesCount() }})
              </button>
            </div>

            <!-- Sort Dropdown -->
            <select
              [value]="selectedSort()"
              (change)="onSortChange($event)"
              aria-label="Sort watchlist"
              class="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 rounded-md px-3 py-1.5 focus:outline-none cursor-pointer hover:border-zinc-500"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 5 UX States Section -->
      <section class="max-w-7xl mx-auto">
        @if (isLoading()) {
          <!-- 1. Loading State -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            @for (i of skeletonItems; track i) {
              <app-loading-skeleton type="card"></app-loading-skeleton>
            }
          </div>
        } @else if (hasError()) {
          <!-- 2. Error State -->
          <app-error-state
            title="Unable to load your list"
            message="We had trouble connecting to your watchlist. Please check your connection and retry."
            (retry)="loadList()"
          ></app-error-state>
        } @else if (displayedItems().length === 0) {
          <!-- 3. Empty State -->
          <app-empty-state
            [title]="selectedFilter() === 'all' ? 'Your list is empty' : 'No ' + selectedFilter() + ' titles found'"
            description="Explore movies and TV shows and click the '+' button on any title to save it for later."
            actionLabel="Explore Movies"
            (actionClick)="goToBrowse()"
          ></app-empty-state>
        } @else {
          <!-- 4. Success Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            @for (item of displayedItems(); track item.id) {
              <div class="relative group">
                <app-content-card
                  [content]="asCardItem(item)"
                  aspectRatio="poster"
                  [isWatchlisted]="true"
                  (play)="playItem(item)"
                  (toggleWatchlist)="removeFromList(item)"
                  (details)="openDetails(item)"
                ></app-content-card>
              </div>
            }
          </div>
        }
      </section>
    </main>
  `,
})
export class MyListComponent implements OnInit {
  private readonly watchlistService = inject(WatchlistService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly selectedFilter = signal<'all' | 'movie' | 'series'>('all');
  readonly selectedSort = signal<'recent' | 'title' | 'rating'>('recent');

  readonly skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  readonly isLoading = this.watchlistService.isLoading;
  readonly hasError = this.watchlistService.hasError;
  readonly allItems = this.watchlistService.watchlistItems;

  readonly profileName = computed(() => {
    return this.profileService.currentProfile()?.name || 'your profile';
  });

  readonly totalCount = computed(() => this.allItems().length);
  readonly movieCount = computed(
    () => this.allItems().filter((i) => !!i.movieId || i.movie).length,
  );
  readonly seriesCount = computed(
    () => this.allItems().filter((i) => !!i.seriesId || i.series).length,
  );

  readonly displayedItems = computed(() => {
    const filter = this.selectedFilter();
    const sort = this.selectedSort();

    let items = this.allItems();
    if (filter === 'movie') {
      items = items.filter((i) => !!i.movieId || i.movie);
    } else if (filter === 'series') {
      items = items.filter((i) => !!i.seriesId || i.series);
    }

    return [...items].sort((a, b) => {
      if (sort === 'title') {
        const titleA = (a.movie?.title || a.series?.title || '').toLowerCase();
        const titleB = (b.movie?.title || b.series?.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      }
      if (sort === 'rating') {
        const ratingA = a.movie?.averageRating ?? a.series?.averageRating ?? 0;
        const ratingB = b.movie?.averageRating ?? b.series?.averageRating ?? 0;
        return ratingB - ratingA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  ngOnInit(): void {
    this.loadList();
  }

  loadList(): void {
    this.watchlistService.loadWatchlist().subscribe();
  }

  setFilter(filter: 'all' | 'movie' | 'series'): void {
    this.selectedFilter.set(filter);
  }

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'recent' | 'title' | 'rating';
    this.selectedSort.set(val);
  }

  removeFromList(item: WatchlistItemDto): void {
    const contentId = item.movieId || item.seriesId || item.id;
    this.watchlistService.removeFromWatchlist(contentId).subscribe();
  }

  playItem(item: WatchlistItemDto): void {
    const id = item.movieId || item.seriesId || item.id;
    this.router.navigate(['/watch', id]);
  }

  openDetails(item: WatchlistItemDto): void {
    const id = item.movieId || item.seriesId || item.id;
    this.router.navigate(['/title', id]);
  }

  goToBrowse(): void {
    this.router.navigate(['/movies']);
  }

  asCardItem(item: WatchlistItemDto): CardContentItem {
    const isSeries = !!item.seriesId || !!item.series;
    const movie = item.movie;
    const series = item.series;

    return {
      id: item.movieId || item.seriesId || item.id,
      title: movie?.title || series?.title || 'Unknown Title',
      description: movie?.description || series?.description || '',
      posterUrl:
        movie?.posterUrl ||
        series?.posterUrl ||
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      backdropUrl:
        movie?.backdropUrl ||
        series?.backdropUrl ||
        'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
      ageRating: movie?.ageRating || series?.ageRating || '16+',
      durationMinutes: movie?.durationMinutes,
      seasonsCount: series?.seasons?.length,
      averageRating: movie?.averageRating ?? series?.averageRating ?? 4.8,
      genres: movie?.genres || series?.genres || [],
      isSeries,
    };
  }
}
