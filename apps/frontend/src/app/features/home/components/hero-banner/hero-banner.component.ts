import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDto, SeriesDto } from '@netflix/shared-types';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (content) {
      <section
        class="relative w-full h-[70vh] sm:h-[80vh] lg:h-[88vh] flex items-center bg-cover bg-center overflow-hidden select-none"
      >
        <!-- Hero Visual / Backdrop Image -->
        <div class="absolute inset-0">
          <img
            [src]="content.backdropUrl || content.posterUrl"
            [alt]="content.title"
            class="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
          />
          <!-- Multi-Directional Gradients for Netflix dark immersion -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/70 sm:via-[#141414]/50 to-transparent"
          ></div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/50"
          ></div>
          <div
            class="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#141414] to-transparent"
          ></div>
        </div>

        <!-- Hero Content Overlay -->
        <div class="relative z-20 max-w-2xl px-4 sm:px-8 md:px-16 space-y-4 pt-12 md:pt-16">
          <!-- Trending Tagline -->
          <div class="inline-flex items-center space-x-2">
            <span class="text-netflix-red font-black text-xl sm:text-2xl tracking-tighter">N</span>
            <span class="text-xs uppercase tracking-widest text-zinc-300 font-semibold">
              {{ isSeries ? 'Series' : 'Film' }}
            </span>
            <span
              class="bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full"
            >
              Top 10 Today
            </span>
          </div>

          <!-- Title -->
          <h1
            class="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-2xl leading-none"
          >
            {{ content.title }}
          </h1>

          <!-- Synopsis Description -->
          <p
            class="text-xs sm:text-sm md:text-base text-zinc-200 line-clamp-3 leading-relaxed drop-shadow max-w-xl"
          >
            {{ content.description }}
          </p>

          <!-- Action Buttons -->
          <div class="flex items-center space-x-3 pt-2">
            <button
              type="button"
              (click)="onPlay()"
              class="flex items-center space-x-2 bg-white text-black px-6 py-2.5 rounded font-bold hover:bg-zinc-200 active:scale-95 transition-all shadow-xl"
            >
              <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Play</span>
            </button>

            <button
              type="button"
              (click)="onMoreInfo()"
              class="flex items-center space-x-2 bg-zinc-600/70 hover:bg-zinc-600/50 text-white px-6 py-2.5 rounded font-bold active:scale-95 transition-all backdrop-blur-sm shadow-xl"
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

        <!-- Bottom Right Badges & Audio Control -->
        <div class="absolute right-0 bottom-24 z-20 flex items-center space-x-3 pr-4 sm:pr-8 md:pr-16">
          <!-- Audio Mute Toggle Button -->
          <button
            type="button"
            (click)="onToggleMute()"
            [attr.aria-label]="isMuted() ? 'Unmute preview' : 'Mute preview'"
            class="w-10 h-10 rounded-full border border-white/40 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
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

          <!-- Age Rating Badge with left border line -->
          <div
            class="bg-zinc-900/80 border-l-4 border-zinc-200 px-3 py-1 text-xs font-bold text-zinc-200 backdrop-blur-sm uppercase tracking-wider"
          >
            {{ content.ageRating || '16+' }}
          </div>
        </div>
      </section>
    }
  `,
})
export class HeroBannerComponent {
  @Input() content: MovieDto | SeriesDto | null = null;
  @Input() isSeries = false;

  @Output() play = new EventEmitter<string>();
  @Output() moreInfo = new EventEmitter<MovieDto | SeriesDto>();

  readonly isMuted = signal(true);

  onPlay(): void {
    if (this.content) {
      this.play.emit(this.content.id);
    }
  }

  onMoreInfo(): void {
    if (this.content) {
      this.moreInfo.emit(this.content);
    }
  }

  onToggleMute(): void {
    this.isMuted.update((v) => !v);
  }
}
