import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { ContentCardComponent, CardContentItem } from '../../shared/components/content-card/content-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { MovieDto } from '@netflix/shared-types';

@Component({
  selector: 'app-my-list',
  standalone: true,
  imports: [CommonModule, ContentCardComponent, EmptyStateComponent],
  template: `
    <main class="min-h-screen pt-24 px-4 md:px-12 text-white space-y-6">
      <div>
        <h1 class="text-3xl font-black tracking-tight">My List</h1>
        <p class="text-xs text-zinc-400">Your personalized queue of movies and series</p>
      </div>

      @if (watchlist().length === 0) {
        <app-empty-state
          title="Your list is empty"
          description="Explore movies and TV shows and click the '+' button to add them here."
          actionLabel="Explore Movies"
          (actionClick)="goToMovies()"
        ></app-empty-state>
      } @else {
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          @for (item of watchlist(); track item.id) {
            <app-content-card
              [content]="asCardItem(item)"
              aspectRatio="backdrop"
              [isWatchlisted]="true"
              (play)="playItem(item.id)"
              (toggleWatchlist)="removeFromList(item.id)"
            ></app-content-card>
          }
        </div>
      }
    </main>
  `,
})
export class MyListComponent implements OnInit {
  private readonly contentService = inject(ContentService);
  private readonly router = inject(Router);

  readonly watchlist = signal<MovieDto[]>([]);

  ngOnInit(): void {
    // Populate with saved or initial mock watchlist items
    this.contentService.getMovies().subscribe((res) => {
      this.watchlist.set(res.items.slice(0, 3));
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

  removeFromList(id: string): void {
    this.watchlist.update((list) => list.filter((m) => m.id !== id));
  }

  playItem(id: string): void {
    this.router.navigate(['/watch', id]);
  }

  goToMovies(): void {
    this.router.navigate(['/movies']);
  }
}
