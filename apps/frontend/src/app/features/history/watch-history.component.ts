import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { WatchHistoryService } from '../../core/services/watch-history.service';
import { ProfileService } from '../../core/services/profile.service';
import { WatchHistoryItemDto } from '@netflix/shared-types';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

type HistoryFilter = 'all' | 'in-progress' | 'completed';

@Component({
  selector: 'app-watch-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="min-h-screen pt-24 pb-20 px-4 md:px-12 text-white bg-[#141414] select-none">
      <section class="max-w-6xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 class="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Viewing Activity
            </h1>
            <p class="text-xs sm:text-sm text-zinc-400 mt-1">
              Watch history and playback progress for <span class="text-zinc-200 font-semibold">{{ profileName() }}</span>
            </p>
          </div>

          <!-- Filter & Action Controls -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Filter Pills -->
            <div class="flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-full text-xs">
              <button
                type="button"
                (click)="setFilter('all')"
                [class.bg-zinc-700]="selectedFilter() === 'all'"
                [class.text-white]="selectedFilter() === 'all'"
                [class.font-bold]="selectedFilter() === 'all'"
                [class.text-zinc-400]="selectedFilter() !== 'all'"
                class="px-3.5 py-1 rounded-full transition-colors hover:text-white"
              >
                All ({{ allItems().length }})
              </button>
              <button
                type="button"
                (click)="setFilter('in-progress')"
                [class.bg-zinc-700]="selectedFilter() === 'in-progress'"
                [class.text-white]="selectedFilter() === 'in-progress'"
                [class.font-bold]="selectedFilter() === 'in-progress'"
                [class.text-zinc-400]="selectedFilter() !== 'in-progress'"
                class="px-3.5 py-1 rounded-full transition-colors hover:text-white"
              >
                In Progress ({{ inProgressCount() }})
              </button>
              <button
                type="button"
                (click)="setFilter('completed')"
                [class.bg-zinc-700]="selectedFilter() === 'completed'"
                [class.text-white]="selectedFilter() === 'completed'"
                [class.font-bold]="selectedFilter() === 'completed'"
                [class.text-zinc-400]="selectedFilter() !== 'completed'"
                class="px-3.5 py-1 rounded-full transition-colors hover:text-white"
              >
                Completed ({{ completedCount() }})
              </button>
            </div>

            <!-- Clear All History Action -->
            @if (allItems().length > 0) {
              <button
                type="button"
                (click)="promptClearHistory()"
                class="text-xs text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-900/60 bg-zinc-900/80 px-3 py-1.5 rounded-full transition-colors font-medium"
              >
                Clear History
              </button>
            }
          </div>
        </div>

        <!-- Feedback Notification Toast -->
        @if (feedbackMessage()) {
          <div
            class="bg-zinc-800/90 border border-zinc-700 text-zinc-200 px-4 py-2.5 rounded-lg text-xs flex items-center justify-between shadow-xl animate-in fade-in"
          >
            <span>{{ feedbackMessage() }}</span>
            <button
              type="button"
              (click)="feedbackMessage.set(null)"
              class="text-zinc-400 hover:text-white ml-3"
            >
              ✕
            </button>
          </div>
        }

        <!-- 5 UX States -->
        @if (isLoading()) {
          <!-- 1. Loading Skeleton -->
          <div class="space-y-3 py-4">
            <app-loading-skeleton type="row" [count]="4"></app-loading-skeleton>
          </div>
        } @else if (hasError()) {
          <!-- 2. Error State with Retry -->
          <app-error-state
            title="Unable to load viewing activity"
            message="We could not synchronize your watch history. Please try again."
            (retry)="loadHistory()"
          ></app-error-state>
        } @else if (filteredItems().length === 0) {
          <!-- 3. Empty State -->
          <div class="py-12">
            <app-empty-state
              title="No viewing activity found"
              [description]="
                selectedFilter() === 'all'
                  ? 'You have not watched any movies or series yet on this profile.'
                  : 'No titles matching the selected filter.'
              "
            ></app-empty-state>
            <div class="text-center mt-4">
              <a
                routerLink="/"
                class="inline-flex items-center space-x-2 bg-white text-black font-bold px-6 py-2.5 rounded hover:bg-zinc-200 transition-colors shadow text-sm"
              >
                <span>Explore Catalog</span>
              </a>
            </div>
          </div>
        } @else {
          <!-- 4. Success State: Chronological List -->
          <div class="divide-y divide-zinc-800/70 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
            @for (item of filteredItems(); track item.id) {
              <div
                class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900/40 transition-colors group"
              >
                <!-- Thumbnail and Metadata -->
                <div class="flex items-center space-x-4 min-w-0">
                  <div
                    class="relative w-24 sm:w-32 aspect-video rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/50"
                  >
                    <img
                      [src]="getItemThumbnail(item)"
                      [alt]="getItemTitle(item)"
                      class="w-full h-full object-cover"
                      loading="lazy"
                    />
                    @if (!item.completed && item.progressPercentage > 0) {
                      <div class="absolute bottom-0 inset-x-0 h-1 bg-zinc-700">
                        <div
                          class="bg-netflix-red h-full"
                          [style.width.%]="item.progressPercentage"
                        ></div>
                      </div>
                    }
                  </div>

                  <div class="min-w-0 space-y-1">
                    <h3 class="text-sm sm:text-base font-bold text-zinc-100 group-hover:text-white truncate">
                      {{ getItemTitle(item) }}
                    </h3>
                    @if (getItemSubtitle(item)) {
                      <p class="text-xs text-zinc-400 font-medium truncate">
                        {{ getItemSubtitle(item) }}
                      </p>
                    }
                    <div class="flex items-center space-x-3 text-[11px] text-zinc-500 font-medium">
                      <span>{{ formatWatchDate(item.lastWatchedAt) }}</span>
                      <span>•</span>
                      @if (item.completed) {
                        <span class="text-emerald-400 font-semibold flex items-center space-x-1">
                          <span>✓ Watched</span>
                        </span>
                      } @else {
                        <span class="text-zinc-300">
                          {{ Math.round(item.progressPercentage) }}% watched ({{ getRemainingMinutes(item) }}m left)
                        </span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Action Controls -->
                <div class="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                  <!-- Resume / Watch Again Button -->
                  <button
                    type="button"
                    (click)="resumePlayback(item)"
                    class="inline-flex items-center space-x-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3.5 py-1.5 rounded font-semibold transition-colors border border-zinc-700/60"
                  >
                    <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>{{ item.completed ? 'Watch Again' : 'Resume' }}</span>
                  </button>

                  <!-- Remove from History Button -->
                  <button
                    type="button"
                    (click)="removeItem(item.id)"
                    title="Hide from viewing history"
                    aria-label="Hide from viewing history"
                    class="w-8 h-8 rounded-full border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-zinc-500 flex items-center justify-center transition-colors focus:outline-none"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Clear Confirmation Modal -->
        @if (isConfirmingClear()) {
          <div
            class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          >
            <div
              class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl text-left"
            >
              <h3 class="text-lg font-bold text-white">Clear viewing history?</h3>
              <p class="text-xs text-zinc-400 leading-relaxed">
                This will remove all titles from the viewing history and Continue Watching queue for
                <span class="text-white font-semibold">{{ profileName() }}</span>. This action cannot be undone.
              </p>
              <div class="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  (click)="isConfirmingClear.set(false)"
                  class="px-4 py-2 rounded text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="confirmClearHistory()"
                  class="px-4 py-2 rounded text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        }
      </section>
    </main>
  `,
})
export class WatchHistoryComponent implements OnInit {
  private readonly watchHistoryService = inject(WatchHistoryService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly Math = Math;

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly selectedFilter = signal<HistoryFilter>('all');
  readonly feedbackMessage = signal<string | null>(null);
  readonly isConfirmingClear = signal(false);

  readonly profileName = computed(() => this.profileService.currentProfile()?.name || 'You');
  readonly allItems = computed(() => this.watchHistoryService.watchHistoryList());

  readonly inProgressCount = computed(
    () => this.allItems().filter((item) => !item.completed).length,
  );
  readonly completedCount = computed(
    () => this.allItems().filter((item) => item.completed).length,
  );

  readonly filteredItems = computed(() => {
    const items = this.allItems();
    const filter = this.selectedFilter();
    if (filter === 'in-progress') {
      return items.filter((i) => !i.completed);
    }
    if (filter === 'completed') {
      return items.filter((i) => i.completed);
    }
    return items;
  });

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const profileId = this.profileService.currentProfile()?.id;

    this.watchHistoryService.loadWatchHistory(profileId).subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: HistoryFilter): void {
    this.selectedFilter.set(filter);
  }

  getItemTitle(item: WatchHistoryItemDto): string {
    if (item.movie) return item.movie.title;
    if (item.episode) {
      return item.episode.seriesTitle || item.episode.title || 'Untitled Series';
    }
    return 'Saved Title';
  }

  getItemSubtitle(item: WatchHistoryItemDto): string | null {
    if (item.episode) {
      return `S${item.episode.seasonNumber || 1}:E${item.episode.episodeNumber} ${item.episode.title}`;
    }
    return null;
  }

  getItemThumbnail(item: WatchHistoryItemDto): string {
    if (item.movie) {
      return item.movie.backdropUrl || item.movie.posterUrl;
    }
    if (item.episode) {
      return item.episode.thumbnailUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500';
    }
    return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500';
  }

  getRemainingMinutes(item: WatchHistoryItemDto): number {
    return Math.max(0, Math.round((item.durationSeconds - item.positionSeconds) / 60));
  }

  formatWatchDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  }

  resumePlayback(item: WatchHistoryItemDto): void {
    const contentId = item.movieId || item.episodeId || item.id;
    this.router.navigate(['/watch', contentId]);
  }

  removeItem(id: string): void {
    const profileId = this.profileService.currentProfile()?.id;
    this.watchHistoryService.removeFromHistory(id, profileId).subscribe({
      next: () => {
        this.feedbackMessage.set('Title hidden from your viewing history.');
      },
    });
  }

  promptClearHistory(): void {
    this.isConfirmingClear.set(true);
  }

  confirmClearHistory(): void {
    const profileId = this.profileService.currentProfile()?.id;
    this.watchHistoryService.clearHistory(profileId).subscribe({
      next: () => {
        this.isConfirmingClear.set(false);
        this.feedbackMessage.set('Your viewing history has been cleared.');
      },
    });
  }
}
