import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md mx-auto my-12 bg-zinc-900/60 border border-zinc-800 rounded-xl backdrop-blur-sm"
    >
      <div
        class="w-16 h-16 rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-netflix-red mb-5 shadow-inner"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 class="text-xl font-bold text-white mb-2">{{ title }}</h3>
      <p class="text-sm text-zinc-400 mb-6 leading-relaxed">{{ message }}</p>

      @if (showRetry) {
        <button
          type="button"
          (click)="retry.emit()"
          class="inline-flex items-center space-x-2 px-5 py-2.5 bg-netflix-red text-white text-sm font-semibold rounded hover:bg-netflix-darkRed active:scale-95 transition-all shadow-lg"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{{ retryLabel }}</span>
        </button>
      }
    </div>
  `,
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'We encountered an error loading this section. Please try again.';
  @Input() retryLabel = 'Try Again';
  @Input() showRetry = true;

  @Output() retry = new EventEmitter<void>();
}
