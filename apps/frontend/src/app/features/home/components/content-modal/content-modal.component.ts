import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDto, SeriesDto, EpisodeDto } from '@netflix/shared-types';

@Component({
  selector: 'app-content-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && content) {
      <div
        class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto flex items-start justify-center pt-8 pb-16 px-3 sm:px-6 select-none animate-in fade-in duration-200"
        (click)="onBackdropClick($event)"
      >
        <!-- Modal Card Container -->
        <div
          class="relative w-full max-w-4xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 text-white z-50"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Close Button -->
          <button
            type="button"
            (click)="onClose()"
            aria-label="Close modal"
            class="absolute top-4 right-4 z-40 w-9 h-9 rounded-full bg-[#181818]/80 hover:bg-[#181818] text-white flex items-center justify-center border border-zinc-700 transition-colors focus:outline-none"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Modal Header Media Visual -->
          <div class="relative w-full aspect-[16/9] max-h-[460px] overflow-hidden">
            <img
              [src]="content.backdropUrl || content.posterUrl"
              [alt]="content.title"
              class="w-full h-full object-cover object-center"
            />
            <!-- Gradient Overlays -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"
            ></div>

            <!-- Header Content Overlay & Quick Actions -->
            <div class="absolute bottom-6 left-6 sm:left-10 right-6 sm:right-10 space-y-3 z-20">
              <h2 class="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight drop-shadow-md">
                {{ content.title }}
              </h2>

              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <!-- Play Button -->
                  <button
                    type="button"
                    (click)="onPlay()"
                    class="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded font-bold hover:bg-zinc-200 active:scale-95 transition-all shadow-lg"
                  >
                    <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>Play</span>
                  </button>

                  <!-- Watchlist Toggle -->
                  <button
                    type="button"
                    (click)="onToggleWatchlist()"
                    [attr.aria-label]="isWatchlisted ? 'Remove from My List' : 'Add to My List'"
                    class="w-10 h-10 rounded-full border-2 border-zinc-400 bg-black/40 hover:border-white text-white flex items-center justify-center transition-colors shadow"
                  >
                    @if (isWatchlisted) {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    } @else {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  </button>

                  <!-- Like / Thumbs Up -->
                  <button
                    type="button"
                    class="w-10 h-10 rounded-full border-2 border-zinc-400 bg-black/40 hover:border-white text-white flex items-center justify-center transition-colors shadow"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </button>
                </div>

                <!-- Sound Mute Toggle -->
                <button
                  type="button"
                  (click)="isMuted.set(!isMuted())"
                  class="w-10 h-10 rounded-full border border-white/40 bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  @if (isMuted()) {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                      />
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  }
                </button>
              </div>
            </div>
          </div>

          <!-- Modal Body Content -->
          <div class="p-6 sm:p-10 space-y-8">
            <!-- Metadata & Details Column Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <!-- Left 2 Cols: Synopsis & Badges -->
              <div class="md:col-span-2 space-y-4">
                <!-- Badges Row -->
                <div class="flex items-center flex-wrap gap-2 text-xs font-semibold">
                  <span class="text-green-400 font-bold text-sm">{{ matchScore }}% Match</span>
                  <span class="text-zinc-400">{{ releaseYear }}</span>
                  <span class="border border-zinc-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-zinc-300">
                    {{ content.ageRating || '16+' }}
                  </span>
                  <span class="text-zinc-400">{{ durationString }}</span>
                  <span class="border border-zinc-700 bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    Ultra HD 4K
                  </span>
                  <span class="border border-zinc-700 bg-zinc-800 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    5.1 Audio
                  </span>
                </div>

                <!-- Synopsis -->
                <p class="text-sm md:text-base text-zinc-200 leading-relaxed font-light">
                  {{ content.description }}
                </p>
              </div>

              <!-- Right 1 Col: Cast, Genres, Tags -->
              <div class="space-y-3 text-xs text-zinc-400 border-l border-zinc-800/80 pl-0 md:pl-6">
                <div>
                  <span class="text-zinc-500">Cast: </span>
                  <span class="text-zinc-300">Elena Rostova, Marcus Vance, Aaron Paul, Sarah Chen</span>
                </div>
                <div>
                  <span class="text-zinc-500">Genres: </span>
                  <span class="text-zinc-300">{{ genresString }}</span>
                </div>
                <div>
                  <span class="text-zinc-500">This show is: </span>
                  <span class="text-zinc-300">Mind-Bending, Suspenseful, Gripping, Atmospheric</span>
                </div>
              </div>
            </div>

            <!-- Series Episodes Section (if content is series) -->
            @if (isSeries && seriesEpisodes.length > 0) {
              <div class="pt-4 border-t border-zinc-800 space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-xl font-bold text-white">Episodes</h3>
                  <span class="text-xs text-zinc-400 font-semibold">Season 1</span>
                </div>

                <!-- Episodes List -->
                <div class="divide-y divide-zinc-800">
                  @for (ep of seriesEpisodes; track ep.id) {
                    <div
                      (click)="onPlay()"
                      class="flex items-center space-x-4 py-4 px-2 hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors group"
                    >
                      <!-- Episode Number -->
                      <span class="text-lg font-bold text-zinc-400 w-6 text-center">
                        {{ ep.episodeNumber }}
                      </span>

                      <!-- Thumbnail -->
                      <div class="relative w-32 sm:w-40 aspect-video rounded overflow-hidden shrink-0 bg-zinc-800">
                        <img [src]="ep.thumbnailUrl" [alt]="ep.title" class="w-full h-full object-cover" />
                        <div
                          class="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors"
                        >
                          <div class="w-8 h-8 rounded-full bg-black/60 border border-white/60 flex items-center justify-center text-white">
                            <svg class="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <!-- Episode Title & Info -->
                      <div class="flex-grow space-y-1">
                        <div class="flex items-center justify-between text-sm font-semibold">
                          <span class="text-white group-hover:text-netflix-red transition-colors">{{ ep.title }}</span>
                          <span class="text-zinc-400 text-xs">{{ ep.durationMinutes }}m</span>
                        </div>
                        <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {{ ep.description }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- More Like This Grid -->
            @if (recommendedItems.length > 0) {
              <div class="pt-6 border-t border-zinc-800 space-y-4">
                <h3 class="text-xl font-bold text-white">More Like This</h3>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  @for (rec of recommendedItems.slice(0, 6); track rec.id) {
                    <div
                      (click)="selectRecommendation(rec)"
                      class="bg-zinc-800/70 border border-zinc-700/60 rounded-md overflow-hidden hover:border-zinc-500 cursor-pointer transition-all duration-200"
                    >
                      <div class="relative aspect-video bg-zinc-900">
                        <img
                          [src]="rec.backdropUrl || rec.posterUrl"
                          [alt]="rec.title"
                          class="w-full h-full object-cover"
                        />
                        <span
                          class="absolute top-2 right-2 border border-zinc-600 bg-black/70 px-1 text-[9px] font-bold rounded"
                        >
                          {{ rec.ageRating || '16+' }}
                        </span>
                      </div>

                      <div class="p-3 space-y-2">
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-green-400 font-bold">96% Match</span>
                          <span class="text-zinc-400 text-[10px]">2025</span>
                        </div>
                        <h4 class="text-xs font-bold text-white truncate">{{ rec.title }}</h4>
                        <p class="text-[11px] text-zinc-400 line-clamp-2 leading-tight">
                          {{ rec.description }}
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- About Section -->
            <div class="pt-6 border-t border-zinc-800 space-y-2 text-xs text-zinc-400">
              <h4 class="text-sm font-bold text-white">About {{ content.title }}</h4>
              <p><span class="text-zinc-500">Director: </span>Christopher Nolan, Denis Villeneuve</p>
              <p><span class="text-zinc-500">Maturity Rating: </span>Recommended for ages {{ content.ageRating || '16+' }} and up</p>
              <p><span class="text-zinc-500">Audio: </span>English [Original], Dolby Atmos 5.1, Spanish, Japanese</p>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ContentModalComponent {
  @Input() isOpen = false;
  @Input() content: MovieDto | SeriesDto | null = null;
  @Input() isWatchlisted = false;
  @Input() recommendedItems: Array<MovieDto | SeriesDto> = [];

  @Output() close = new EventEmitter<void>();
  @Output() play = new EventEmitter<string>();
  @Output() toggleWatchlist = new EventEmitter<string>();
  @Output() changeContent = new EventEmitter<MovieDto | SeriesDto>();

  readonly isMuted = signal(true);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  get isSeries(): boolean {
    return !!this.content && 'seasons' in this.content;
  }

  get seriesEpisodes(): EpisodeDto[] {
    if (this.isSeries) {
      const series = this.content as SeriesDto;
      return series.seasons?.[0]?.episodes || [];
    }
    return [];
  }

  get matchScore(): number {
    const movie = this.content as MovieDto;
    if (movie?.averageRating) {
      return Math.round(movie.averageRating * 20);
    }
    return 98;
  }

  get releaseYear(): string {
    if (this.content?.releaseDate) {
      return new Date(this.content.releaseDate).getFullYear().toString();
    }
    return '2025';
  }

  get durationString(): string {
    if (this.isSeries) {
      const series = this.content as SeriesDto;
      const count = series.seasons?.length || 1;
      return `${count} ${count > 1 ? 'Seasons' : 'Season'}`;
    }
    const movie = this.content as MovieDto;
    if (movie?.durationMinutes) {
      const h = Math.floor(movie.durationMinutes / 60);
      const m = movie.durationMinutes % 60;
      return `${h}h ${m}m`;
    }
    return '2h 8m';
  }

  get genresString(): string {
    if (this.content?.genres) {
      return this.content.genres.map((g) => g.name).join(', ');
    }
    return 'Action, Sci-Fi, Drama';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onPlay(): void {
    if (this.content) {
      this.play.emit(this.content.id);
    }
  }

  onToggleWatchlist(): void {
    if (this.content) {
      this.toggleWatchlist.emit(this.content.id);
    }
  }

  selectRecommendation(item: MovieDto | SeriesDto): void {
    this.changeContent.emit(item);
  }
}
