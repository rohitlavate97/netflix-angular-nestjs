import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenreDto } from '@netflix/shared-types';

@Component({
  selector: 'app-cast-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 text-sm text-zinc-300">
      <!-- Cast Members -->
      <div>
        <h4 class="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">Cast</h4>
        <div class="flex flex-wrap gap-2">
          @for (member of castMembers; track member) {
            <span
              class="px-3 py-1 bg-zinc-800/80 border border-zinc-700/60 rounded-full text-xs text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors cursor-default"
            >
              {{ member }}
            </span>
          }
        </div>
      </div>

      <!-- Genres -->
      @if (genres.length > 0) {
        <div>
          <h4 class="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">Genres</h4>
          <div class="flex flex-wrap gap-2">
            @for (genre of genres; track genre.id) {
              <span
                class="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-md text-xs font-semibold text-zinc-300"
              >
                {{ genre.name }}
              </span>
            }
          </div>
        </div>
      }

      <!-- Directors & Creators -->
      <div>
        <h4 class="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">Creators & Directors</h4>
        <p class="text-xs text-zinc-400">
          Directed by <span class="text-zinc-200 font-medium">{{ directors.join(', ') }}</span>
        </p>
      </div>

      <!-- Maturity Advisory Descriptors -->
      <div>
        <h4 class="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">Content Advisory</h4>
        <div class="flex flex-wrap gap-2">
          @for (tag of maturityTags; track tag) {
            <span
              class="px-2.5 py-1 bg-red-950/40 border border-red-800/50 text-red-300 text-[11px] font-medium rounded"
            >
              {{ tag }}
            </span>
          }
        </div>
      </div>
    </div>
  `,
})
export class CastListComponent {
  @Input() cast: string[] = [];
  @Input() genres: GenreDto[] = [];
  @Input() directors: string[] = ['Christopher Nolan', 'Denis Villeneuve'];

  get castMembers(): string[] {
    return this.cast.length > 0
      ? this.cast
      : ['Elena Rostova', 'Marcus Vance', 'Aaron Paul', 'Sarah Chen', 'David Harbour'];
  }

  get maturityTags(): string[] {
    return [
      'Sci-Fi Violence',
      'Intense Psychological Sequences',
      'Strong Language',
      'Substance Use',
    ];
  }
}
