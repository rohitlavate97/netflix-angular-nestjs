import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CardContentItem {
  id: string;
  title: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  ageRating?: string;
  durationMinutes?: number;
  seasonsCount?: number;
  averageRating?: number;
  genres?: Array<{ name: string; slug: string }>;
  isSeries?: boolean;
}

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="group relative rounded-md overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl hover:border-zinc-700 cursor-pointer select-none"
      [ngClass]="aspectRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-video'"
      (click)="onCardClick()"
    >
      <!-- Media Image / Fallback -->
      @if (imageUrl && !imageFailed()) {
        <img
          [src]="imageUrl"
          [alt]="content.title"
          (error)="imageFailed.set(true)"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:brightness-90"
          loading="lazy"
        />
      } @else {
        <!-- Aesthetic Gradient Fallback -->
        <div
          class="w-full h-full flex flex-col justify-end p-4 bg-gradient-to-tr from-black via-zinc-900 to-zinc-800"
        >
          <span class="text-xs uppercase tracking-wider font-semibold text-netflix-red mb-1">
            {{ content.isSeries ? 'Series' : 'Movie' }}
          </span>
          <span class="text-sm font-bold text-white line-clamp-2 drop-shadow">{{ content.title }}</span>
        </div>
      }

      <!-- Bottom Gradient Overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity pointer-events-none"
      ></div>

      <!-- Hover Information & Action Controls -->
      <div
        class="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
      >
        <!-- Title and Metadata -->
        <h4 class="text-xs md:text-sm font-bold text-white drop-shadow truncate">
          {{ content.title }}
        </h4>

        <!-- Action Buttons (Shown on Hover) -->
        <div
          class="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-1"
        >
          <div class="flex items-center space-x-2">
            <!-- Play Button -->
            <button
              type="button"
              (click)="onPlay($event)"
              aria-label="Play title"
              class="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition-colors shadow"
            >
              <svg class="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            <!-- Watchlist Button -->
            <button
              type="button"
              (click)="onToggleWatchlist($event)"
              [attr.aria-label]="isWatchlisted ? 'Remove from My List' : 'Add to My List'"
              class="w-7 h-7 rounded-full border border-zinc-400 bg-zinc-900/80 text-white flex items-center justify-center hover:border-white hover:bg-zinc-800 transition-colors"
            >
              @if (isWatchlisted) {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
              } @else {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              }
            </button>

            <!-- Like / Thumbs Up -->
            <button
              type="button"
              (click)="onLike($event)"
              aria-label="Like title"
              class="w-7 h-7 rounded-full border border-zinc-400 bg-zinc-900/80 text-white flex items-center justify-center hover:border-white hover:bg-zinc-800 transition-colors"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </button>
          </div>

          <!-- Chevron Details Trigger -->
          <button
            type="button"
            (click)="onDetails($event)"
            aria-label="More details"
            class="w-7 h-7 rounded-full border border-zinc-400 bg-zinc-900/80 text-white flex items-center justify-center hover:border-white hover:bg-zinc-800 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- Badges Row -->
        <div class="flex items-center space-x-2 text-[10px] md:text-xs text-zinc-300 pt-0.5">
          <span class="text-green-400 font-bold">{{ matchScore }}% Match</span>
          <span class="border border-zinc-600 px-1 py-0.2 rounded text-[9px] uppercase font-semibold text-zinc-300">
            {{ content.ageRating || '16+' }}
          </span>
          <span class="text-zinc-400">
            {{ durationDisplay }}
          </span>
          <span class="border border-zinc-600 px-1 rounded text-[9px] font-semibold text-zinc-400">HD</span>
        </div>

        <!-- Genre Tags -->
        @if (genresDisplay) {
          <div class="text-[10px] text-zinc-400 line-clamp-1">
            {{ genresDisplay }}
          </div>
        }
      </div>
    </div>
  `,
})
export class ContentCardComponent {
  @Input({ required: true }) content!: CardContentItem;
  @Input() aspectRatio: 'backdrop' | 'poster' = 'backdrop';
  @Input() isWatchlisted = false;

  @Output() play = new EventEmitter<CardContentItem>();
  @Output() toggleWatchlist = new EventEmitter<CardContentItem>();
  @Output() details = new EventEmitter<CardContentItem>();

  readonly imageFailed = signal(false);

  get imageUrl(): string | undefined {
    return this.aspectRatio === 'poster'
      ? this.content?.posterUrl || this.content?.backdropUrl
      : this.content?.backdropUrl || this.content?.posterUrl;
  }

  get matchScore(): number {
    if (this.content?.averageRating) {
      return Math.round(this.content.averageRating * 20);
    }
    return 95;
  }

  get durationDisplay(): string {
    if (this.content?.seasonsCount) {
      return `${this.content.seasonsCount} ${this.content.seasonsCount > 1 ? 'Seasons' : 'Season'}`;
    }
    if (this.content?.durationMinutes) {
      const hours = Math.floor(this.content.durationMinutes / 60);
      const mins = this.content.durationMinutes % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return '1h 50m';
  }

  get genresDisplay(): string {
    if (this.content?.genres && this.content.genres.length > 0) {
      return this.content.genres.map((g) => g.name).join(' • ');
    }
    return '';
  }

  onCardClick(): void {
    this.details.emit(this.content);
  }

  onPlay(event: Event): void {
    event.stopPropagation();
    this.play.emit(this.content);
  }

  onToggleWatchlist(event: Event): void {
    event.stopPropagation();
    this.toggleWatchlist.emit(this.content);
  }

  onLike(event: Event): void {
    event.stopPropagation();
  }

  onDetails(event: Event): void {
    event.stopPropagation();
    this.details.emit(this.content);
  }
}
