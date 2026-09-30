import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ContentService } from '../../core/services/content.service';
import {
  SearchResultItemDto,
  SearchEntityType,
  SearchSortBy,
  SearchQueryDto,
} from '@netflix/shared-types';
import {
  ContentCardComponent,
  CardContentItem,
} from '../../shared/components/content-card/content-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContentCardComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="min-h-screen text-white bg-[#141414] pt-24 pb-20 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      <!-- Search Input Header -->
      <section class="mb-8 space-y-4">
        <div class="relative max-w-2xl mx-auto sm:mx-0">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
            <svg class="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            type="text"
            [ngModel]="queryText()"
            (ngModelChange)="onQueryInput($event)"
            placeholder="Search by title, genre, actor, or keyword..."
            class="w-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 focus:border-white focus:outline-none text-white text-base sm:text-lg pl-12 pr-10 py-3.5 rounded-full shadow-2xl transition-all placeholder-zinc-500"
          />

          @if (queryText()) {
            <button
              type="button"
              (click)="clearSearch()"
              aria-label="Clear search input"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }
        </div>

        <!-- Filter and Sort Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-zinc-800 pb-4">
          <!-- Entity Type Filter Chips -->
          <div class="flex items-center space-x-2">
            <button
              type="button"
              (click)="setType('all')"
              [class.bg-white]="selectedType() === 'all'"
              [class.text-black]="selectedType() === 'all'"
              [class.font-bold]="selectedType() === 'all'"
              [class.bg-zinc-800]="selectedType() !== 'all'"
              [class.text-zinc-300]="selectedType() !== 'all'"
              class="px-4 py-1.5 rounded-full text-xs transition-all hover:bg-zinc-700"
            >
              All
            </button>
            <button
              type="button"
              (click)="setType('movie')"
              [class.bg-white]="selectedType() === 'movie'"
              [class.text-black]="selectedType() === 'movie'"
              [class.font-bold]="selectedType() === 'movie'"
              [class.bg-zinc-800]="selectedType() !== 'movie'"
              [class.text-zinc-300]="selectedType() !== 'movie'"
              class="px-4 py-1.5 rounded-full text-xs transition-all hover:bg-zinc-700"
            >
              Movies
            </button>
            <button
              type="button"
              (click)="setType('series')"
              [class.bg-white]="selectedType() === 'series'"
              [class.text-black]="selectedType() === 'series'"
              [class.font-bold]="selectedType() === 'series'"
              [class.bg-zinc-800]="selectedType() !== 'series'"
              [class.text-zinc-300]="selectedType() !== 'series'"
              class="px-4 py-1.5 rounded-full text-xs transition-all hover:bg-zinc-700"
            >
              TV Series
            </button>
          </div>

          <!-- Secondary Filters: Genre & Sort -->
          <div class="flex items-center space-x-3">
            <!-- Genre Filter -->
            <select
              [value]="selectedGenre()"
              (change)="onGenreChange($event)"
              aria-label="Filter by genre"
              class="bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-200 rounded px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="">All Genres</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="action">Action</option>
              <option value="thriller">Thriller</option>
              <option value="drama">Drama</option>
              <option value="adventure">Adventure</option>
              <option value="cyberpunk">Cyberpunk</option>
            </select>

            <!-- Sort By Filter -->
            <select
              [value]="selectedSort()"
              (change)="onSortChange($event)"
              aria-label="Sort search results"
              class="bg-zinc-900 border border-zinc-700 text-xs sm:text-sm text-zinc-200 rounded px-3 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest Releases</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Search State Feedback Header -->
      @if (queryText() && !isLoading()) {
        <div class="mb-6 flex items-baseline justify-between text-xs sm:text-sm text-zinc-400">
          <p>
            Showing {{ totalResults() }} result{{ totalResults() === 1 ? '' : 's' }} for
            <span class="text-white font-bold">"{{ queryText() }}"</span>
          </p>
        </div>
      }

      <!-- Main Results / UX States Section -->
      @if (isLoading()) {
        <!-- 1. Loading Shimmer Skeleton State -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          @for (i of skeletonItems; track i) {
            <app-loading-skeleton type="card"></app-loading-skeleton>
          }
        </div>
      } @else if (hasError()) {
        <!-- 2. Error State -->
        <app-error-state
          title="Search could not be completed"
          message="We encountered an issue querying the catalog. Please try again."
          (retry)="executeSearch()"
        ></app-error-state>
      } @else if (queryText() && totalResults() === 0) {
        <!-- 3. Empty State with Suggested Fallbacks -->
        <div class="space-y-12">
          <app-empty-state
            [title]="'No matches found for &quot;' + queryText() + '&quot;'"
            description="Suggestions: Try different keywords, check your spelling, or explore popular recommendations below."
            actionLabel="Clear Search"
            (actionClick)="clearSearch()"
          ></app-empty-state>

          <!-- Fallback Recommendations -->
          @if (popularTitles().length > 0) {
            <section class="space-y-4 pt-6 border-t border-zinc-800">
              <h3 class="text-lg font-bold text-white tracking-wide">Popular on StreamFlix</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                @for (item of popularTitles(); track item.id) {
                  <app-content-card
                    [content]="asCardItem(item)"
                    aspectRatio="poster"
                    (play)="onPlay(item)"
                    (details)="onDetails(item)"
                  ></app-content-card>
                }
              </div>
            </section>
          }
        </div>
      } @else if (!queryText()) {
        <!-- 4. Initial Discovery State (Explore Keywords & Trending) -->
        <section class="space-y-10 py-6">
          <div class="space-y-3">
            <h2 class="text-lg font-bold text-zinc-300">Popular Searches</h2>
            <div class="flex flex-wrap gap-2.5">
              @for (tag of popularKeywords; track tag) {
                <button
                  type="button"
                  (click)="selectKeyword(tag)"
                  class="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 rounded-full text-xs sm:text-sm text-zinc-300 hover:text-white transition-all shadow-md active:scale-95"
                >
                  {{ tag }}
                </button>
              }
            </div>
          </div>

          <!-- Featured Titles to Discover -->
          @if (popularTitles().length > 0) {
            <div class="space-y-4">
              <h2 class="text-lg font-bold text-white tracking-wide">Explore Recommended Titles</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                @for (item of popularTitles(); track item.id) {
                  <app-content-card
                    [content]="asCardItem(item)"
                    aspectRatio="poster"
                    (play)="onPlay(item)"
                    (details)="onDetails(item)"
                  ></app-content-card>
                }
              </div>
            </div>
          }
        </section>
      } @else {
        <!-- 5. Success Results Grid -->
        <section class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          @for (item of searchResults(); track item.id) {
            <app-content-card
              [content]="asCardItem(item)"
              aspectRatio="poster"
              (play)="onPlay(item)"
              (details)="onDetails(item)"
            ></app-content-card>
          }
        </section>
      }
    </main>
  `,
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly queryText = signal('');
  readonly selectedType = signal<SearchEntityType>('all' as SearchEntityType);
  readonly selectedGenre = signal('');
  readonly selectedSort = signal<SearchSortBy>('relevance' as SearchSortBy);

  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly searchResults = signal<SearchResultItemDto[]>([]);
  readonly totalResults = signal(0);
  readonly popularTitles = signal<SearchResultItemDto[]>([]);

  readonly skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  readonly popularKeywords = [
    'Cyberpunk',
    'Space Odyssey',
    'Artificial Intelligence',
    'Mind-Bending',
    'Interstellar',
    'Action Thriller',
    'Dark Mystery',
  ];

  private readonly searchInput$ = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamSubscription?: Subscription;

  ngOnInit(): void {
    // Debounce live typing to eliminate spam queries
    this.searchSubscription = this.searchInput$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((text) => {
        this.updateQueryParams({ q: text || null });
      });

    // Listen to query parameters from URL for deep-linking
    this.queryParamSubscription = this.route.queryParams.subscribe((params) => {
      const q = params['q'] || '';
      const type = (params['type'] as SearchEntityType) || ('all' as SearchEntityType);
      const genre = params['genre'] || '';
      const sortBy = (params['sortBy'] as SearchSortBy) || ('relevance' as SearchSortBy);

      this.queryText.set(q);
      this.selectedType.set(type);
      this.selectedGenre.set(genre);
      this.selectedSort.set(sortBy);

      if (q) {
        this.executeSearch();
      } else {
        this.searchResults.set([]);
        this.totalResults.set(0);
        this.loadPopularFallback();
      }
    });

    this.loadPopularFallback();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamSubscription?.unsubscribe();
  }

  onQueryInput(value: string): void {
    this.queryText.set(value);
    this.searchInput$.next(value);
  }

  clearSearch(): void {
    this.queryText.set('');
    this.updateQueryParams({ q: null });
  }

  selectKeyword(tag: string): void {
    this.queryText.set(tag);
    this.updateQueryParams({ q: tag });
  }

  setType(type: 'all' | 'movie' | 'series' | SearchEntityType): void {
    this.selectedType.set(type as SearchEntityType);
    this.updateQueryParams({ type: type === 'all' ? null : type });
  }

  onGenreChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.selectedGenre.set(val);
    this.updateQueryParams({ genre: val || null });
  }

  onSortChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as SearchSortBy;
    this.selectedSort.set(val);
    this.updateQueryParams({ sortBy: val === 'relevance' ? null : val });
  }

  executeSearch(): void {
    const q = this.queryText().trim();
    if (!q) {
      this.searchResults.set([]);
      this.totalResults.set(0);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    const queryDto: SearchQueryDto = {
      q,
      type: this.selectedType(),
      genre: this.selectedGenre() || undefined,
      sortBy: this.selectedSort(),
      limit: 30,
    };

    this.contentService.search(queryDto).subscribe({
      next: (res) => {
        this.searchResults.set(res.items);
        this.totalResults.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private loadPopularFallback(): void {
    if (this.popularTitles().length > 0) return;

    this.contentService.getMovies().subscribe({
      next: (res) => {
        const mapped: SearchResultItemDto[] = res.items.slice(0, 6).map((m) => ({
          id: m.id,
          title: m.title,
          slug: m.slug,
          description: m.description,
          type: 'movie',
          posterUrl: m.posterUrl,
          backdropUrl: m.backdropUrl,
          releaseDate: m.releaseDate,
          ageRating: m.ageRating,
          durationMinutes: m.durationMinutes,
          averageRating: m.averageRating,
          genres: m.genres,
        }));
        this.popularTitles.set(mapped);
      },
    });
  }

  private updateQueryParams(params: Record<string, string | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  onPlay(item: SearchResultItemDto): void {
    this.router.navigate(['/watch', item.id]);
  }

  onDetails(item: SearchResultItemDto): void {
    this.router.navigate(['/title', item.id]);
  }

  asCardItem(item: SearchResultItemDto): CardContentItem {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      ageRating: item.ageRating,
      durationMinutes: item.durationMinutes,
      seasonsCount: item.seasonsCount,
      averageRating: item.averageRating ?? 4.8,
      genres: item.genres,
      isSeries: item.type === 'series',
    };
  }
}
