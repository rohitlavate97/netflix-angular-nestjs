import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ContentCardComponent,
  CardContentItem,
} from '../../../../shared/components/content-card/content-card.component';
import { MovieDto, SeriesDto } from '@netflix/shared-types';

@Component({
  selector: 'app-content-row',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  template: `
    <div class="relative group/row space-y-2 py-2 select-none">
      <!-- Row Title Header -->
      <div class="flex items-baseline space-x-2 px-4 sm:px-8 md:px-16">
        <h3
          class="text-base sm:text-lg md:text-xl font-bold text-zinc-100 group-hover/row:text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
        >
          <span>{{ title }}</span>
          <span
            class="text-xs text-cyan-400 font-semibold opacity-0 group-hover/row:opacity-100 -translate-x-1 group-hover/row:translate-x-1 transition-all duration-200"
          >
            Explore All ›
          </span>
        </h3>
      </div>

      <!-- Carousel Viewport & Slider Wrapper -->
      <div class="relative">
        <!-- Left Slider Navigation Button -->
        @if (canScrollLeft()) {
          <button
            type="button"
            (click)="scrollLeft()"
            aria-label="Scroll left"
            class="hidden md:flex absolute top-0 bottom-0 left-0 z-40 w-12 bg-black/60 hover:bg-black/85 text-white items-center justify-center transition-all duration-200 opacity-0 group-hover/row:opacity-100 focus:outline-none"
          >
            <svg class="w-8 h-8 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        }

        <!-- Horizontal Scrollable Container -->
        <div
          #scrollContainer
          (scroll)="onScroll()"
          class="flex items-center space-x-3 overflow-x-auto scroll-smooth py-4 px-4 sm:px-8 md:px-16 no-scrollbar"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          @for (item of items; track item.id; let idx = $index) {
            @if (isTop10) {
              <!-- Top 10 Styled Card with Giant Number -->
              <div
                class="flex items-center shrink-0 w-52 sm:w-64 md:w-72 group/top10 relative transition-transform duration-300 hover:scale-105 hover:z-30 cursor-pointer"
              >
                <!-- Large Stylized Rank Numeral -->
                <span
                  class="font-black text-7xl sm:text-8xl md:text-9xl text-zinc-800 -mr-6 sm:-mr-8 z-10 select-none stroke-zinc-600 transition-colors group-hover/top10:text-zinc-600 drop-shadow-lg"
                  style="-webkit-text-stroke: 4px #595959;"
                >
                  {{ idx + 1 }}
                </span>

                <!-- Card Media -->
                <div class="w-36 sm:w-44 md:w-48 shrink-0">
                  <app-content-card
                    [content]="asCardItem(item)"
                    aspectRatio="poster"
                    [isWatchlisted]="isItemWatchlisted(item.id)"
                    (play)="onPlay(item.id)"
                    (toggleWatchlist)="onToggleWatchlist(item.id)"
                    (details)="onDetails(item)"
                  ></app-content-card>
                </div>
              </div>
            } @else {
              <!-- Standard Horizontal Carousel Card -->
              <div
                class="shrink-0 w-44 sm:w-56 md:w-64 lg:w-72"
                [class.pb-2]="isProgressRow"
              >
                <app-content-card
                  [content]="asCardItem(item)"
                  aspectRatio="backdrop"
                  [isWatchlisted]="isItemWatchlisted(item.id)"
                  (play)="onPlay(item.id)"
                  (toggleWatchlist)="onToggleWatchlist(item.id)"
                  (details)="onDetails(item)"
                ></app-content-card>

                <!-- Continue Watching Progress Bar -->
                @if (isProgressRow) {
                  <div class="mt-1 w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div
                      class="bg-netflix-red h-full rounded-full"
                      [style.width.%]="getProgressPercentage(item.id, idx)"
                    ></div>
                  </div>
                }
              </div>
            }
          }
        </div>

        <!-- Right Slider Navigation Button -->
        @if (canScrollRight()) {
          <button
            type="button"
            (click)="scrollRight()"
            aria-label="Scroll right"
            class="hidden md:flex absolute top-0 bottom-0 right-0 z-40 w-12 bg-black/60 hover:bg-black/85 text-white items-center justify-center transition-all duration-200 opacity-0 group-hover/row:opacity-100 focus:outline-none"
          >
            <svg class="w-8 h-8 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `,
  ],
})
export class ContentRowComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) items: Array<MovieDto | SeriesDto> = [];
  @Input() isTop10 = false;
  @Input() isProgressRow = false;
  @Input() watchlistedIds: Set<string> = new Set();

  @Output() play = new EventEmitter<string>();
  @Output() toggleWatchlist = new EventEmitter<string>();
  @Output() openDetails = new EventEmitter<MovieDto | SeriesDto>();

  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLDivElement>;

  readonly canScrollLeft = signal(false);
  readonly canScrollRight = signal(true);

  onScroll(): void {
    if (!this.scrollContainerRef) return;
    const el = this.scrollContainerRef.nativeElement;
    this.canScrollLeft.set(el.scrollLeft > 10);
    this.canScrollRight.set(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  scrollLeft(): void {
    if (!this.scrollContainerRef) return;
    const el = this.scrollContainerRef.nativeElement;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }

  scrollRight(): void {
    if (!this.scrollContainerRef) return;
    const el = this.scrollContainerRef.nativeElement;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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

  isItemWatchlisted(id: string): boolean {
    return this.watchlistedIds.has(id);
  }

  getProgressPercentage(_id: string, idx: number): number {
    // Generate realistic viewing progress values for continue watching demo
    const progressValues = [65, 30, 85, 45, 90, 20];
    return progressValues[idx % progressValues.length];
  }

  onPlay(id: string): void {
    this.play.emit(id);
  }

  onToggleWatchlist(id: string): void {
    this.toggleWatchlist.emit(id);
  }

  onDetails(item: MovieDto | SeriesDto): void {
    this.openDetails.emit(item);
  }
}
