import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { WatchHistoryService } from '../../core/services/watch-history.service';
import { ProfileService } from '../../core/services/profile.service';
import { SeasonSelectorComponent } from './components/season-selector/season-selector.component';
import { EpisodePickerComponent } from './components/episode-picker/episode-picker.component';
import { CastListComponent } from './components/cast-list/cast-list.component';
import { ContentCardComponent, CardContentItem } from '../../shared/components/content-card/content-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { MovieDto, SeriesDto, SeasonDto, EpisodeDto, ResumePlaybackDto } from '@netflix/shared-types';


@Component({
  selector: 'app-content-details',
  standalone: true,
  imports: [
    CommonModule,
    SeasonSelectorComponent,
    EpisodePickerComponent,
    CastListComponent,
    ContentCardComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="min-h-screen text-white bg-[#141414] pb-24 select-none">
      <!-- Loading State -->
      @if (isLoading()) {
        <app-loading-skeleton type="banner"></app-loading-skeleton>
        <div class="max-w-6xl mx-auto px-4 sm:px-8 py-8">
          <app-loading-skeleton type="row" [count]="4"></app-loading-skeleton>
        </div>
      } @else if (hasError()) {
        <!-- Error State -->
        <div class="pt-24">
          <app-error-state
            title="Failed to load title details"
            message="We could not retrieve this title information. Please check your connection."
            (retry)="loadContent()"
          ></app-error-state>
        </div>
      } @else if (!content()) {
        <!-- 404 / Empty State -->
        <div class="pt-24">
          <app-empty-state
            title="Title not found"
            description="The movie or series you are looking for is not available in our catalog."
            actionLabel="Return to Home"
            (actionClick)="goBack()"
          ></app-empty-state>
        </div>
      } @else {
        <!-- Hero Backdrop Section -->
        <section class="relative w-full h-[65vh] sm:h-[75vh] md:h-[82vh] overflow-hidden">
          <img
            [src]="backdropUrl"
            [alt]="content()?.title"
            class="w-full h-full object-cover object-center scale-105"
          />

          <!-- Gradient Overlays -->
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-black/60"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 sm:via-[#141414]/30 to-transparent"
          ></div>

          <!-- Top Navigation Return Button -->
          <div class="absolute top-20 sm:top-24 left-4 sm:left-8 md:left-16 z-30">
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center space-x-2 text-zinc-300 hover:text-white bg-black/60 hover:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold border border-zinc-700 transition-all shadow-md active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Browse</span>
            </button>
          </div>

          <!-- Hero Details & Controls -->
          <div
            class="absolute bottom-8 sm:bottom-12 left-4 sm:left-8 md:left-16 right-4 sm:right-8 md:right-16 z-20 space-y-4 max-w-3xl"
          >
            <!-- Badge / Format Tag -->
            <div class="inline-flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-widest">
              <span>StreamFlix {{ isSeries() ? 'Original Series' : 'Original Film' }}</span>
            </div>

            <!-- Title -->
            <h1 class="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight drop-shadow-xl">
              {{ content()?.title }}
            </h1>

            <!-- Quick Action Buttons -->
            <div class="flex items-center flex-wrap gap-3 pt-2">
              <!-- Play / Resume Button -->
              <button
                type="button"
                (click)="onPlay()"
                class="flex items-center space-x-2 bg-white text-black px-7 py-3 rounded font-bold hover:bg-zinc-200 active:scale-95 transition-all shadow-2xl"
              >
                <svg class="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span class="text-base">{{ hasResume() ? 'Resume (' + remainingMinutes() + 'm left)' : 'Play' }}</span>
              </button>

              @if (hasResume()) {
                <button
                  type="button"
                  (click)="restartPlayback()"
                  class="flex items-center space-x-1.5 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 py-3 rounded font-semibold text-xs transition-colors border border-zinc-700 active:scale-95"
                >
                  <svg class="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Restart</span>
                </button>
              }


              <!-- Watchlist Toggle Button -->
              <button
                type="button"
                (click)="toggleWatchlist()"
                [attr.aria-label]="isWatchlisted() ? 'Remove from My List' : 'Add to My List'"
                class="w-12 h-12 rounded-full border-2 border-zinc-400 bg-black/50 hover:border-white text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
              >
                @if (isWatchlisted()) {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              </button>

              <!-- Like Button -->
              <button
                type="button"
                class="w-12 h-12 rounded-full border-2 border-zinc-400 bg-black/50 hover:border-white text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </button>

              <!-- Share Button -->
              <button
                type="button"
                (click)="shareTitle()"
                class="w-12 h-12 rounded-full border-2 border-zinc-400 bg-black/50 hover:border-white text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>

              @if (shareToast()) {
                <span class="text-xs bg-zinc-800 border border-zinc-700 text-white px-3 py-1.5 rounded animate-fade-in">
                  Link copied!
                </span>
              }
            </div>

            <!-- Resume Progress Indicator -->
            @if (hasResume()) {
              <div class="max-w-md space-y-1.5 pt-1">
                <div class="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="bg-netflix-red h-full rounded-full transition-all"
                    [style.width.%]="resumeData()?.progressPercentage || 0"
                  ></div>
                </div>
                <p class="text-[11px] text-zinc-400 font-medium">
                  {{ Math.round(resumeData()?.progressPercentage || 0) }}% watched • {{ remainingMinutes() }} minutes remaining
                </p>
              </div>
            }
          </div>
        </section>


        <!-- Main Body Content Section -->
        <section class="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-12">
          <!-- Metadata Bar & Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-zinc-800">
            <!-- Left 2 Cols: Badges & Storyline -->
            <div class="md:col-span-2 space-y-4">
              <!-- Badges Row -->
              <div class="flex items-center flex-wrap gap-2 text-xs font-semibold">
                <span class="text-green-400 font-bold text-sm">{{ matchScore }}% Match</span>
                <span class="text-zinc-400">{{ releaseYear }}</span>
                <span class="border border-zinc-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-zinc-300">
                  {{ content()?.ageRating || '16+' }}
                </span>
                <span class="text-zinc-400">{{ durationString }}</span>
                <span class="border border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Ultra HD 4K
                </span>
                <span class="border border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  HDR10
                </span>
                <span class="border border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                  Dolby Atmos
                </span>
              </div>

              <!-- Synopsis -->
              <p class="text-base sm:text-lg text-zinc-200 leading-relaxed font-light">
                {{ content()?.description }}
              </p>
            </div>

            <!-- Right 1 Col: Cast & Advisory Metadata -->
            <div>
              <app-cast-list
                [genres]="content()?.genres || []"
              ></app-cast-list>
            </div>
          </div>

          <!-- Series Episodic Content Section -->
          @if (isSeries() && seasonsList().length > 0) {
            <section class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold tracking-tight">Episodes</h2>
                <app-season-selector
                  [seasons]="seasonsList()"
                  [selectedSeasonId]="selectedSeason()?.id || ''"
                  (seasonSelect)="onSeasonSelect($event)"
                ></app-season-selector>
              </div>

              <!-- Episodes List -->
              <app-episode-picker
                [episodes]="currentEpisodes()"
                (playEpisode)="onPlayEpisode($event)"
              ></app-episode-picker>
            </section>
          }

          <!-- More Like This Recommendation Grid -->
          @if (similarTitles().length > 0) {
            <section class="space-y-6 pt-4 border-t border-zinc-800">
              <h2 class="text-2xl font-bold tracking-tight">More Like This</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                @for (item of similarTitles(); track item.id) {
                  <app-content-card
                    [content]="asCardItem(item)"
                    aspectRatio="backdrop"
                    (play)="onSelectSimilar(item.id)"
                    (details)="onSelectSimilar(item.id)"
                  ></app-content-card>
                }
              </div>
            </section>
          }

          <!-- About Production Details -->
          <section class="pt-6 border-t border-zinc-800 space-y-4 text-xs text-zinc-400">
            <h3 class="text-base font-bold text-white uppercase tracking-wider">About {{ content()?.title }}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p><span class="text-zinc-500">Audio: </span>English [Original], Dolby Atmos 5.1, Spanish, Hindi, Japanese</p>
                <p><span class="text-zinc-500">Subtitles: </span>English [CC], Spanish, French, German, Japanese</p>
              </div>
              <div>
                <p><span class="text-zinc-500">Maturity Rating: </span>Suitable for ages {{ content()?.ageRating || '16+' }}</p>
                <p><span class="text-zinc-500">Content Warning: </span>Intense sequences, mild threat, stylized sci-fi action</p>
              </div>
            </div>
          </section>
        </section>
      }
    </main>
  `,
})
export class ContentDetailsComponent implements OnInit {
  @Input() id!: string;

  private readonly contentService = inject(ContentService);
  private readonly watchHistoryService = inject(WatchHistoryService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly Math = Math;
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly content = signal<MovieDto | SeriesDto | null>(null);
  readonly selectedSeason = signal<SeasonDto | null>(null);
  readonly isWatchlisted = signal(false);
  readonly shareToast = signal(false);
  readonly similarTitles = signal<Array<MovieDto | SeriesDto>>([]);
  readonly resumeData = signal<ResumePlaybackDto | null>(null);

  readonly hasResume = computed(() => {
    const r = this.resumeData();
    return !!r && r.positionSeconds > 10 && !r.completed;
  });

  readonly remainingMinutes = computed(() => {
    const r = this.resumeData();
    if (!r) return 0;
    return Math.max(0, Math.round((r.durationSeconds - r.positionSeconds) / 60));
  });


  readonly isSeries = computed(() => {
    const c = this.content();
    return !!c && 'seasons' in c;
  });

  readonly seasonsList = computed(() => {
    if (this.isSeries()) {
      const s = this.content() as SeriesDto;
      return s.seasons || [];
    }
    return [];
  });

  readonly currentEpisodes = computed(() => {
    return this.selectedSeason()?.episodes || [];
  });

  get backdropUrl(): string {
    const c = this.content();
    return c?.backdropUrl || c?.posterUrl || '';
  }

  get matchScore(): number {
    const c = this.content();
    if (c && 'averageRating' in c && typeof (c as { averageRating?: number }).averageRating === 'number') {
      return Math.round(((c as { averageRating: number }).averageRating) * 20);
    }
    return 97;
  }

  get releaseYear(): string {
    const c = this.content();
    return c?.releaseDate ? new Date(c.releaseDate).getFullYear().toString() : '2025';
  }

  get durationString(): string {
    if (this.isSeries()) {
      const count = this.seasonsList().length || 1;
      return `${count} ${count > 1 ? 'Seasons' : 'Season'}`;
    }
    const movie = this.content() as MovieDto;
    if (movie?.durationMinutes) {
      const h = Math.floor(movie.durationMinutes / 60);
      const m = movie.durationMinutes % 60;
      return `${h}h ${m}m`;
    }
    return '2h 10m';
  }

  ngOnInit(): void {
    this.loadContent();
  }

  loadContent(): void {
    if (!this.id) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.hasError.set(false);

    this.contentService.getContentById(this.id).subscribe({
      next: (item) => {
        this.content.set(item);
        if (item) {
          if ('seasons' in item) {
            const s = item as SeriesDto;
            if (s.seasons && s.seasons.length > 0) {
              this.selectedSeason.set(s.seasons[0]);
            }
          }
          this.loadSimilar();
          this.loadResumePosition(item);
        }
        this.isLoading.set(false);

      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  private loadResumePosition(item: MovieDto | SeriesDto): void {
    const profileId = this.profileService.currentProfile()?.id || 'demo-profile-1';
    const isSeries = 'seasons' in item;
    this.watchHistoryService.getResumePlayback(profileId, item.id, isSeries).subscribe({
      next: (res) => this.resumeData.set(res),
    });
  }

  private loadSimilar(): void {
    this.contentService.getMovies().subscribe({
      next: (res) => {
        this.similarTitles.set(
          res.items.filter((m) => m.id !== this.id).slice(0, 6)
        );
      },
    });
  }

  onSeasonSelect(season: SeasonDto): void {
    this.selectedSeason.set(season);
  }

  toggleWatchlist(): void {
    this.isWatchlisted.update((v) => !v);
  }

  shareTitle(): void {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      this.shareToast.set(true);
      setTimeout(() => this.shareToast.set(false), 2500);
    }
  }

  onPlay(): void {
    const c = this.content();
    if (c) {
      if (this.hasResume()) {
        this.router.navigate(['/watch', c.id], {
          queryParams: { t: this.resumeData()?.positionSeconds },
        });
      } else {
        this.router.navigate(['/watch', c.id]);
      }
    }
  }

  restartPlayback(): void {
    const c = this.content();
    if (c) {
      this.router.navigate(['/watch', c.id], {
        queryParams: { t: 0 },
      });
    }
  }


  onPlayEpisode(episode: EpisodeDto): void {
    const c = this.content();
    if (c) {
      this.router.navigate(['/watch', c.id], { queryParams: { episode: episode.id } });
    }
  }

  onSelectSimilar(id: string): void {
    this.router.navigate(['/title', id]);
    this.id = id;
    this.loadContent();
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  asCardItem(item: MovieDto | SeriesDto): CardContentItem {
    const isSeries = 'seasons' in item;
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
}
