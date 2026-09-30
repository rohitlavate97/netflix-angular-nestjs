import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center py-20 px-6 text-center max-w-lg mx-auto my-8"
    >
      <div
        class="w-20 h-20 rounded-full bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 mb-6 shadow-md"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
      </div>

      <h3 class="text-2xl font-bold text-white mb-2">{{ title }}</h3>
      <p class="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">{{ description }}</p>

      @if (actionLabel) {
        <button
          type="button"
          (click)="actionClick.emit()"
          class="px-6 py-2.5 bg-white text-black font-semibold text-sm rounded hover:bg-zinc-200 active:scale-95 transition-all shadow-md"
        >
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = 'Nothing to see here yet';
  @Input() description = 'Explore our catalog to find movies and TV shows you will love.';
  @Input() actionLabel?: string;

  @Output() actionClick = new EventEmitter<void>();
}
