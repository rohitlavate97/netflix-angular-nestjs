import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { ContentCardComponent, CardContentItem } from '../../shared/components/content-card/content-card.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { MovieDto } from '@netflix/shared-types';

@Component({
  selector: 'app-new-popular',
  standalone: true,
  imports: [CommonModule, ContentCardComponent, LoadingSkeletonComponent],
  template: `
    <main class="min-h-screen pt-24 px-4 md:px-12 text-white space-y-10 pb-16">
      <div>
        <h1 class="text-3xl font-black tracking-tight">New & Popular</h1>
        <p class="text-xs text-zinc-400">Discover trending blockbusters and anticipated upcoming releases</p>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="grid" [count]="6"></app-loading-skeleton>
      } @else {
        <!-- Top 10 Today Section -->
        <section class="space-y-4">
          <h2 class="text-xl font-bold flex items-center space-x-2">
            <span class="text-netflix-red">Top 10</span>
            <span>in Your Country Today</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (movie of topList(); track movie.id; let idx = $index) {
              <div
                class="flex items-center space-x-4 bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
              >
                <!-- Large Number Badge -->
                <span
                  class="font-black text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-700 w-14 text-center select-none"
                >
                  {{ idx + 1 }}
                </span>

                <div class="flex-grow">
                  <app-content-card
                    [content]="asCardItem(movie)"
                    aspectRatio="backdrop"
                    (play)="playItem(movie.id)"
                  ></app-content-card>
                </div>
              </div>
            }
          </div>
        </section>
      }
    </main>
  `,
})
export class NewPopularComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);

  readonly isLoading = signal(true);
  readonly topList = signal<MovieDto[]>([]);

  ngOnInit(): void {
    this.contentService.getMovies().subscribe({
      next: (res) => {
        this.topList.set(res.items.slice(0, 6));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  asCardItem(movie: MovieDto): CardContentItem {
    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      ageRating: movie.ageRating,
      durationMinutes: movie.durationMinutes,
      averageRating: movie.averageRating,
      genres: movie.genres,
      isSeries: false,
    };
  }

  playItem(id: string): void {
    this.router.navigate(['/watch', id]);
  }
}
