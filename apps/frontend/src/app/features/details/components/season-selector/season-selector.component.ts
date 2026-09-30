import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeasonDto } from '@netflix/shared-types';

@Component({
  selector: 'app-season-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (seasons.length > 0) {
      <div class="relative inline-block text-left select-none">
        <label for="season-select" class="sr-only">Select Season</label>
        <div class="relative">
          <select
            id="season-select"
            [value]="selectedSeasonId"
            (change)="onSeasonChange($event)"
            class="appearance-none bg-zinc-900 border border-zinc-700 text-white font-semibold text-sm sm:text-base py-2.5 pl-4 pr-10 rounded-md cursor-pointer hover:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-colors shadow-lg"
          >
            @for (season of seasons; track season.id) {
              <option [value]="season.id" class="bg-zinc-900 text-white py-1">
                {{ season.title || ('Season ' + season.seasonNumber) }} ({{ season.episodes.length || 0 }} Episodes)
              </option>
            }
          </select>

          <!-- Dropdown Arrow Icon -->
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              />
            </svg>
          </div>
        </div>
      </div>
    }
  `,
})
export class SeasonSelectorComponent {
  @Input() seasons: SeasonDto[] = [];
  @Input() selectedSeasonId = '';

  @Output() seasonSelect = new EventEmitter<SeasonDto>();

  onSeasonChange(event: Event): void {
    const selectEl = event.target as HTMLSelectElement;
    const season = this.seasons.find((s) => s.id === selectEl.value);
    if (season) {
      this.seasonSelect.emit(season);
    }
  }
}
