import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { ContentCardComponent, CardContentItem } from '../../shared/components/content-card/content-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SeriesDto } from '@netflix/shared-types';

@Component({
  selector: 'app-series',
  standalone: true,
  imports: [
    CommonModule,
    ContentCardComponent,
    LoadingSkeletonComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  template: `
    <main class="min-h-screen pt-24 px-4 md:px-12 text-white space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-3xl font-black tracking-tight">TV Shows</h1>
          <p class="text-xs text-zinc-400">Binge-worthy series, limited editions, and episodic dramas</p>
        </div>

        <div class="flex items-center space-x-2 overflow-x-auto pb-1">
          @for (genre of genres; track genre) {
            <button
              type="button"
              (click)="selectGenre(genre)"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
              [class.bg-white]="selectedGenre() === genre"
              [class.text-black]="selectedGenre() === genre"
              [class.bg-zinc-800]="selectedGenre() !== genre"
              [class.text-zinc-300]="selectedGenre() !== genre"
              [class.hover:bg-zinc-700]="selectedGenre() !== genre"
            >
              {{ genre }}
            </button>
          }
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="grid" [count]="12"></app-loading-skeleton>
      } @else if (hasError()) {
        <app-error-state
          title="Failed to load series"
          message="Could not retrieve the TV shows catalog. Please try again."
          (retry)="loadSeries()"
        ></app-error-state>
      } @else if (series().length === 0) {
        <app-empty-state
          title="No series found"
          description="There are currently no TV shows available under this filter."
          actionLabel="View All Series"
          (actionClick)="selectGenre('All')"
        ></app-empty-state>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          @for (item of series(); track item.id) {
            <app-content-card
              [content]="asCardItem(item)"
              aspectRatio="backdrop"
              (play)="playSeries(item.id)"
            ></app-content-card>
          }
        </div>
      }
    </main>
  `,
})
export class SeriesComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);

  readonly genres = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Drama', 'Adventure'];
  readonly selectedGenre = signal('All');
  readonly isLoading = signal(true);
  readonly hasError = signal(false);
  readonly series = signal<SeriesDto[]>([]);

  ngOnInit(): void {
    this.loadSeries();
  }

  selectGenre(genre: string): void {
    this.selectedGenre.set(genre);
    this.loadSeries();
  }

  loadSeries(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const genre = this.selectedGenre() === 'All' ? undefined : this.selectedGenre().toLowerCase();
    this.contentService.getSeries({ genre }).subscribe({
      next: (res) => {
        this.series.set(res.items);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  asCardItem(series: SeriesDto): CardContentItem {
    return {
      id: series.id,
      title: series.title,
      description: series.description,
      posterUrl: series.posterUrl,
      backdropUrl: series.backdropUrl,
      ageRating: series.ageRating,
      seasonsCount: series.seasons?.length || 1,
      averageRating: 4.8,
      genres: series.genres,
      isSeries: true,
    };
  }

  playSeries(id: string): void {
    this.router.navigate(['/watch', id]);
  }
}
