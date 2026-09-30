import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('banner') {
        <div class="relative w-full h-[65vh] md:h-[80vh] skeleton-shimmer rounded-b-lg">
          <div class="absolute bottom-16 left-6 md:left-16 space-y-4 max-w-lg w-full">
            <div class="h-6 w-32 bg-zinc-800 rounded"></div>
            <div class="h-12 w-3/4 bg-zinc-800 rounded"></div>
            <div class="h-4 w-full bg-zinc-800 rounded"></div>
            <div class="h-4 w-2/3 bg-zinc-800 rounded"></div>
            <div class="flex space-x-4 pt-2">
              <div class="h-10 w-28 bg-zinc-800 rounded"></div>
              <div class="h-10 w-36 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      }
      @case ('row') {
        <div class="space-y-3 px-4 md:px-12 my-6">
          <div class="h-6 w-48 bg-zinc-800 rounded"></div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            @for (item of counterArray; track $index) {
              <div
                class="aspect-video w-full rounded-md skeleton-shimmer bg-zinc-800 border border-zinc-700/30"
              ></div>
            }
          </div>
        </div>
      }
      @case ('grid') {
        <div
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 px-4 md:px-12 py-8"
        >
          @for (item of counterArray; track $index) {
            <div
              class="aspect-[2/3] w-full rounded-md skeleton-shimmer bg-zinc-800 border border-zinc-700/30"
            ></div>
          }
        </div>
      }
      @default {
        <div
          class="aspect-video w-full rounded-md skeleton-shimmer bg-zinc-800 border border-zinc-700/30"
        ></div>
      }
    }
  `,
})
export class LoadingSkeletonComponent {
  @Input() type: 'banner' | 'card' | 'row' | 'grid' = 'row';
  @Input() set count(val: number) {
    this.counterArray = Array(val).fill(0);
  }

  counterArray = Array(6).fill(0);
}
