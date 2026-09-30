import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { ContentCardComponent, CardContentItem } from '../../shared/components/content-card/content-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ContentCategoryRowDto, MovieDto, SeriesDto } from '@netflix/shared-types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ContentCardComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="min-h-screen text-white">
      <!-- Loading State for Hero & Rows -->
      @if (isLoading()) {
        <app-loading-skeleton type="banner"></app-loading-skeleton>
        <app-loading-skeleton type="row" [count]="6"></app-loading-skeleton>
        <app-loading-skeleton type="row" [count]="6"></app-loading-skeleton>
      } @else if (hasError()) {
        <!-- Error State with Retry -->
        <app-error-state
          title="Could not load homepage feed"
          message="We were unable to load the catalog rows. Please verify your connection."
          (retry)="loadFeed()"
        ></app-error-state>
      } @else {
        <!-- Hero Banner Section -->
        @if (heroMovie()) {
          <section
            class="relative w-full h-[70vh] md:h-[85vh] flex items-center bg-cover bg-center overflow-hidden"
          >
            <!-- Background Image -->
            <div class="absolute inset-0">
              <img
                [src]="heroMovie()?.backdropUrl"
                [alt]="heroMovie()?.title"
                class="w-full h-full object-cover object-center"
              />
              <div
                class="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"
              ></div>
              <div
                class="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/40"
              ></div>
            </div>

            <!-- Hero Text Content -->
            <div class="relative z-20 max-w-2xl px-6 md:px-16 space-y-4 pt-16">
              <div
                class="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-red-400 border border-white/10"
              >
                <span>🔥 #1 in Movies Today</span>
              </div>

              <h1 class="text-3xl md:text-6xl font-black tracking-tight drop-shadow-lg uppercase">
                {{ heroMovie()?.title }}
              </h1>

              <p class="text-sm md:text-base text-zinc-300 line-clamp-3 leading-relaxed drop-shadow-md">
                {{ heroMovie()?.description }}
              </p>

              <!-- Hero Actions -->
              <div class="flex items-center space-x-4 pt-2">
                <button
                  type="button"
                  (click)="playMedia(heroMovie()!.id)"
                  class="flex items-center space-x-2 bg-white text-black px-6 py-2.5 rounded font-bold hover:bg-zinc-200 transition-colors shadow-lg active:scale-95"
                >
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Play</span>
                </button>

                <button
                  type="button"
                  (click)="openDetails(heroMovie()!.id)"
                  class="flex items-center space-x-2 bg-zinc-600/70 text-white px-6 py-2.5 rounded font-bold hover:bg-zinc-600/50 transition-colors backdrop-blur-sm active:scale-95"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>More Info</span>
                </button>
              </div>
            </div>
          </section>
        }

        <!-- Dynamic Content Rows -->
        <section class="relative z-20 -mt-16 md:-mt-28 px-4 md:px-12 space-y-10 pb-16">
          @for (row of categoryRows(); track row.category.id) {
            <div>
              <h2 class="text-lg md:text-xl font-bold mb-3 text-zinc-100 flex items-center space-x-2">
                <span>{{ row.category.name }}</span>
              </h2>

              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                @for (item of row.movies; track item.id) {
                  <app-content-card
                    [content]="asCardItem(item)"
                    aspectRatio="backdrop"
                    [isWatchlisted]="isItemWatchlisted(item.id)"
                    (play)="playMedia(item.id)"
                    (toggleWatchlist)="toggleWatchlist(item.id)"
                    (details)="openDetails(item.id)"
                  ></app-content-card>
                }
                @for (s of row.series; track s.id) {
                  <app-content-card
                    [content]="asCardItem(s, true)"
                    aspectRatio="backdrop"
                    [isWatchlisted]="isItemWatchlisted(s.id)"
                    (play)="playMedia(s.id)"
                    (toggleWatchlist)="toggleWatchlist(s.id)"
                    (details)="openDetails(s.id)"
                  ></app-content-card>
                }
              </div>
            </div>
          } @empty {
            <app-empty-state
              title="No content available"
              description="Check back soon as new movies and series are added to StreamFlix."
            ></app-empty-state>
          }
        </section>
      }
    </main>
  `,
})
export class HomeComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly categoryRows = signal<ContentCategoryRowDto[]>([]);
  readonly heroMovie = signal<MovieDto | null>(null);
  readonly watchlistedIds = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.contentService.getHomeFeed().subscribe({
      next: (rows) => {
        this.categoryRows.set(rows);
        if (rows.length > 0 && rows[0].movies.length > 0) {
          this.heroMovie.set(rows[0].movies[0]);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  asCardItem(item: MovieDto | SeriesDto, isSeries = false): CardContentItem {
    const movie = !isSeries ? (item as MovieDto) : undefined;
    const series = isSeries ? (item as SeriesDto) : undefined;
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      posterUrl: item.posterUrl,
      backdropUrl: item.backdropUrl,
      ageRating: item.ageRating,
      durationMinutes: movie?.durationMinutes,
      seasonsCount: series?.seasons?.length,
      averageRating: movie?.averageRating ?? 4.8,
      genres: item.genres,
      isSeries,
    };
  }

  isItemWatchlisted(id: string): boolean {
    return this.watchlistedIds().has(id);
  }

  toggleWatchlist(id: string): void {
    this.watchlistedIds.update((set) => {
      const updated = new Set(set);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }

  playMedia(id: string): void {
    this.router.navigate(['/watch', id]);
  }

  openDetails(id: string): void {
    // In Phase 10 this will open the content details modal
    console.log('Open details for:', id);
  }
}
