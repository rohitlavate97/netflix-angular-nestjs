import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { ProfileService } from '../../core/services/profile.service';
import { HeroBannerComponent } from './components/hero-banner/hero-banner.component';
import { ContentRowComponent } from './components/content-row/content-row.component';
import { ContentModalComponent } from './components/content-modal/content-modal.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ContentCategoryRowDto, MovieDto, SeriesDto } from '@netflix/shared-types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroBannerComponent,
    ContentRowComponent,
    ContentModalComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="min-h-screen text-white bg-[#141414] overflow-x-hidden">
      <!-- Loading State: Banner + Row Skeletons -->
      @if (isLoading()) {
        <app-loading-skeleton type="banner"></app-loading-skeleton>
        <app-loading-skeleton type="row" [count]="6"></app-loading-skeleton>
        <app-loading-skeleton type="row" [count]="6"></app-loading-skeleton>
      } @else if (hasError()) {
        <!-- Error State with Retry -->
        <app-error-state
          title="Could not load homepage feed"
          message="We were unable to connect to the catalog feed. Please verify your connection."
          (retry)="loadFeed()"
        ></app-error-state>
      } @else {
        <!-- Dynamic Hero Banner -->
        @if (heroContent()) {
          <app-hero-banner
            [content]="heroContent()"
            [isSeries]="isHeroSeries()"
            (play)="playMedia($event)"
            (moreInfo)="openDetailsModal($event)"
          ></app-hero-banner>
        }

        <!-- Horizontal Netflix Content Rows -->
        <div class="relative z-20 -mt-16 sm:-mt-24 md:-mt-32 space-y-6 md:space-y-10 pb-20">
          <!-- Continue Watching Row (Personalized for active profile) -->
          @if (continueWatchingList().length > 0) {
            <app-content-row
              [title]="'Continue Watching for ' + profileName()"
              [items]="continueWatchingList()"
              [isProgressRow]="true"
              [watchlistedIds]="watchlistedIds()"
              (play)="playMedia($event)"
              (toggleWatchlist)="toggleWatchlist($event)"
              (openDetails)="openDetailsModal($event)"
            ></app-content-row>
          }

          <!-- Curated Category Feed Rows -->
          @for (row of categoryRows(); track row.category.id) {
            <app-content-row
              [title]="row.category.name"
              [items]="getRowItems(row)"
              [isTop10]="row.category.slug === 'top-10'"
              [watchlistedIds]="watchlistedIds()"
              (play)="playMedia($event)"
              (toggleWatchlist)="toggleWatchlist($event)"
              (openDetails)="openDetailsModal($event)"
            ></app-content-row>
          } @empty {
            <app-empty-state
              title="No content available"
              description="Check back soon as new movies and series are added to StreamFlix."
            ></app-empty-state>
          }
        </div>

        <!-- Quick Preview Modal -->
        <app-content-modal
          [isOpen]="isModalOpen()"
          [content]="selectedModalContent()"
          [isWatchlisted]="isModalContentWatchlisted()"
          [recommendedItems]="recommendedItems()"
          (close)="closeModal()"
          (play)="playMedia($event)"
          (toggleWatchlist)="toggleWatchlist($event)"
          (changeContent)="openDetailsModal($event)"
        ></app-content-modal>
      }
    </main>
  `,
})
export class HomeComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly categoryRows = signal<ContentCategoryRowDto[]>([]);
  readonly heroContent = signal<MovieDto | SeriesDto | null>(null);
  readonly continueWatchingList = signal<Array<MovieDto | SeriesDto>>([]);
  readonly watchlistedIds = signal<Set<string>>(new Set(['movie-1', 'series-1']));
  readonly selectedModalContent = signal<MovieDto | SeriesDto | null>(null);

  readonly isModalOpen = computed(() => !!this.selectedModalContent());
  readonly isHeroSeries = computed(
    () => !!this.heroContent() && 'seasons' in (this.heroContent() as object)
  );
  readonly profileName = computed(() => this.profileService.currentProfile()?.name || 'You');
  readonly recommendedItems = computed(() => {
    const all: Array<MovieDto | SeriesDto> = [];
    for (const row of this.categoryRows()) {
      all.push(...row.movies, ...row.series);
    }
    return all.filter((item) => item.id !== this.selectedModalContent()?.id);
  });

  ngOnInit(): void {
    this.loadFeed();
  }

  loadFeed(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.contentService.getHomeFeed().subscribe({
      next: (rows) => {
        this.categoryRows.set(rows);
        if (rows.length > 0) {
          // Select featured hero from the first category
          const firstRow = rows[0];
          if (firstRow.movies.length > 0) {
            this.heroContent.set(firstRow.movies[0]);
          } else if (firstRow.series.length > 0) {
            this.heroContent.set(firstRow.series[0]);
          }

          // Populate realistic continue watching queue
          if (rows.length >= 2) {
            this.continueWatchingList.set([
              ...rows[0].movies.slice(1, 3),
              ...rows[1].movies.slice(0, 2),
            ]);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  getRowItems(row: ContentCategoryRowDto): Array<MovieDto | SeriesDto> {
    return [...row.movies, ...row.series];
  }

  isModalContentWatchlisted(): boolean {
    const current = this.selectedModalContent();
    return !!current && this.watchlistedIds().has(current.id);
  }

  toggleWatchlist(id: string): void {
    this.watchlistedIds.update((set) => {
      const updated = new Set(set);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  }

  openDetailsModal(content: MovieDto | SeriesDto): void {
    this.selectedModalContent.set(content);
  }

  closeModal(): void {
    this.selectedModalContent.set(null);
  }

  playMedia(id: string): void {
    this.router.navigate(['/watch', id]);
  }
}
