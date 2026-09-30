import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpisodeDto } from '@netflix/shared-types';

@Component({
  selector: 'app-episode-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 select-none">
      <div class="divide-y divide-zinc-800 border-t border-b border-zinc-800">
        @for (episode of episodes; track episode.id) {
          <div
            (click)="onPlayEpisode(episode)"
            class="group flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-5 py-5 px-3 sm:px-4 rounded-lg hover:bg-zinc-800/60 transition-colors cursor-pointer"
          >
            <!-- Episode Number -->
            <span
              class="hidden sm:block text-2xl font-bold text-zinc-500 group-hover:text-zinc-300 w-8 text-center shrink-0"
            >
              {{ episode.episodeNumber }}
            </span>

            <!-- Episode Thumbnail with Play Overlay -->
            <div class="relative w-full sm:w-48 aspect-video rounded-md overflow-hidden bg-zinc-900 shrink-0 border border-zinc-700/50">
              <img
                [src]="episode.thumbnailUrl"
                [alt]="episode.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />

              <!-- Hover Play Button Overlay -->
              <div
                class="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors"
              >
                <div
                  class="w-10 h-10 rounded-full bg-black/70 border border-white/80 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg"
                >
                  <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              <!-- Runtime Pill -->
              <span
                class="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300"
              >
                {{ episode.durationMinutes }}m
              </span>
            </div>

            <!-- Episode Details -->
            <div class="flex-grow space-y-1">
              <div class="flex items-baseline justify-between">
                <h4
                  class="text-sm sm:text-base font-bold text-white group-hover:text-netflix-red transition-colors"
                >
                  <span class="sm:hidden font-bold mr-1">Ep {{ episode.episodeNumber }}.</span>
                  {{ episode.title }}
                </h4>
                <span class="hidden sm:inline-block text-xs font-semibold text-zinc-400">
                  {{ episode.durationMinutes }}m
                </span>
              </div>

              <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3 font-light">
                {{ episode.description || 'No detailed description available for this episode.' }}
              </p>
            </div>
          </div>
        } @empty {
          <div class="py-12 text-center text-zinc-500 text-sm">
            No episodes currently available for this season.
          </div>
        }
      </div>
    </div>
  `,
})
export class EpisodePickerComponent {
  @Input() episodes: EpisodeDto[] = [];
  @Output() playEpisode = new EventEmitter<EpisodeDto>();

  onPlayEpisode(episode: EpisodeDto): void {
    this.playEpisode.emit(episode);
  }
}
