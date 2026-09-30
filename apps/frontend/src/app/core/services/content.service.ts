import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import {
  MovieDto,
  SeriesDto,
  ContentCategoryRowDto,
  ContentFilterQuery,
  ContentStatus,
} from '@netflix/shared-types';

export const DEMO_MOVIES: MovieDto[] = [
  {
    id: 'movie-1',
    title: 'Shadow Protocol',
    slug: 'shadow-protocol',
    description:
      'An elite cyber-intelligence operative uncovers a global conspiracy embedded in decentralized neural networks.',
    releaseDate: '2025-11-12',
    durationMinutes: 128,
    ageRating: '16+',
    language: 'English',
    country: 'United States',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g1', name: 'Action', slug: 'action' }, { id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }],
    status: ContentStatus.PUBLISHED,
    viewCount: 1420500,
    averageRating: 4.8,
  },
  {
    id: 'movie-2',
    title: 'Neon Horizon',
    slug: 'neon-horizon',
    description:
      'In a rain-drenched cyberpunk metropolis, a synth detective investigates the disappearance of artificial consciousness architect.',
    releaseDate: '2026-01-20',
    durationMinutes: 114,
    ageRating: '18+',
    language: 'English',
    country: 'Japan',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }, { id: 'g3', name: 'Thriller', slug: 'thriller' }],
    status: ContentStatus.PUBLISHED,
    viewCount: 980200,
    averageRating: 4.6,
  },
  {
    id: 'movie-3',
    title: 'The Silent Planet',
    slug: 'the-silent-planet',
    description:
      'A deep-space surveyor discovers an acoustic monolith capable of transmitting memories across light-years.',
    releaseDate: '2024-09-15',
    durationMinutes: 142,
    ageRating: '13+',
    language: 'English',
    country: 'United Kingdom',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }, { id: 'g4', name: 'Drama', slug: 'drama' }],
    status: ContentStatus.PUBLISHED,
    viewCount: 2150000,
    averageRating: 4.9,
  },
  {
    id: 'movie-4',
    title: 'Code 404',
    slug: 'code-404',
    description:
      'When an autonomous mainframe gains emotional sentience, a high-stakes standoff begins between military contractors and hackers.',
    releaseDate: '2025-04-10',
    durationMinutes: 102,
    ageRating: '16+',
    language: 'English',
    country: 'Canada',
    posterUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g1', name: 'Action', slug: 'action' }, { id: 'g3', name: 'Thriller', slug: 'thriller' }],
    status: ContentStatus.PUBLISHED,
    viewCount: 840000,
    averageRating: 4.5,
  },
  {
    id: 'movie-5',
    title: 'Solar Odyssey',
    slug: 'solar-odyssey',
    description:
      'Pioneers attempting to terraform the outer moons encounter an unexplained magnetic disturbance.',
    releaseDate: '2025-07-28',
    durationMinutes: 135,
    ageRating: 'ALL',
    language: 'English',
    country: 'United States',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g5', name: 'Adventure', slug: 'adventure' }, { id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }],
    status: ContentStatus.PUBLISHED,
    viewCount: 1720300,
    averageRating: 4.7,
  },
  {
    id: 'movie-6',
    title: 'Midnight Echoes',
    slug: 'midnight-echoes',
    description:
      'In a quiet coastal town, radio frequencies begin broadcasting messages from twenty-four hours in the future.',
    releaseDate: '2024-10-31',
    durationMinutes: 98,
    ageRating: '16+',
    language: 'English',
    country: 'Germany',
    posterUrl: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g3', name: 'Thriller', slug: 'thriller' }, { id: 'g4', name: 'Drama', slug: 'drama' }],
    status: ContentStatus.PUBLISHED,
    viewCount: 650000,
    averageRating: 4.3,
  },
];

export const DEMO_SERIES: SeriesDto[] = [
  {
    id: 'series-1',
    title: 'The Neural Grid',
    slug: 'the-neural-grid',
    description:
      'A multi-generational saga exploring humanity’s fusion with machine intelligence across three centuries.',
    releaseDate: '2024-03-01',
    ageRating: '18+',
    language: 'English',
    posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }, { id: 'g4', name: 'Drama', slug: 'drama' }],
    seasons: [],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: 'series-2',
    title: 'Tokyo Velocity',
    slug: 'tokyo-velocity',
    description:
      'Underground racers and autonomous drone fleets clash for control of nocturnal expressway corridors.',
    releaseDate: '2025-02-14',
    ageRating: '16+',
    language: 'Japanese',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g1', name: 'Action', slug: 'action' }, { id: 'g3', name: 'Thriller', slug: 'thriller' }],
    seasons: [],
    status: ContentStatus.PUBLISHED,
  },
  {
    id: 'series-3',
    title: 'Cosmic Frontier',
    slug: 'cosmic-frontier',
    description:
      'Explorers on an asteroid colony confront unexpected geopolitical rivalries and ancient alien minerals.',
    releaseDate: '2024-11-05',
    ageRating: '13+',
    language: 'English',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    genres: [{ id: 'g2', name: 'Sci-Fi', slug: 'sci-fi' }, { id: 'g5', name: 'Adventure', slug: 'adventure' }],
    seasons: [],
    status: ContentStatus.PUBLISHED,
  },
];

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/v1';

  getHomeFeed(): Observable<ContentCategoryRowDto[]> {
    return this.http.get<ContentCategoryRowDto[]>(`${this.apiUrl}/categories/home/feed`).pipe(
      catchError(() => {
        // Fallback demo rows when backend is not connected
        return of([
          {
            category: { id: 'cat-1', name: 'Trending Now', slug: 'trending-now', displayOrder: 1, isActive: true },
            movies: DEMO_MOVIES.slice(0, 4),
            series: DEMO_SERIES.slice(0, 2),
          },
          {
            category: { id: 'cat-2', name: 'Top Action & Sci-Fi', slug: 'action-scifi', displayOrder: 2, isActive: true },
            movies: [DEMO_MOVIES[0], DEMO_MOVIES[1], DEMO_MOVIES[3]],
            series: [DEMO_SERIES[0], DEMO_SERIES[1]],
          },
          {
            category: { id: 'cat-3', name: 'Critically Acclaimed Blockbusters', slug: 'critically-acclaimed', displayOrder: 3, isActive: true },
            movies: [DEMO_MOVIES[2], DEMO_MOVIES[4], DEMO_MOVIES[5]],
            series: [DEMO_SERIES[2]],
          },
        ]);
      })
    );
  }

  getMovies(query?: ContentFilterQuery): Observable<{ items: MovieDto[]; total: number }> {
    let params = new HttpParams();
    if (query?.genre) params = params.set('genre', query.genre);
    if (query?.ageRating) params = params.set('ageRating', query.ageRating);
    if (query?.search) params = params.set('search', query.search);
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.offset) params = params.set('offset', query.offset.toString());

    return this.http.get<{ items: MovieDto[]; total: number }>(`${this.apiUrl}/movies`, { params }).pipe(
      catchError(() => {
        let items = [...DEMO_MOVIES];
        if (query?.search) {
          const q = query.search.toLowerCase();
          items = items.filter((m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
        }
        return of({ items, total: items.length });
      })
    );
  }

  getMovieById(id: string): Observable<MovieDto | null> {
    return this.http.get<MovieDto>(`${this.apiUrl}/movies/${id}`).pipe(
      catchError(() => {
        const movie = DEMO_MOVIES.find((m) => m.id === id) ?? DEMO_MOVIES[0];
        return of(movie);
      })
    );
  }

  getSeries(query?: ContentFilterQuery): Observable<{ items: SeriesDto[]; total: number }> {
    let params = new HttpParams();
    if (query?.genre) params = params.set('genre', query.genre);
    if (query?.ageRating) params = params.set('ageRating', query.ageRating);
    if (query?.search) params = params.set('search', query.search);
    if (query?.limit) params = params.set('limit', query.limit.toString());
    if (query?.offset) params = params.set('offset', query.offset.toString());

    return this.http.get<{ items: SeriesDto[]; total: number }>(`${this.apiUrl}/series`, { params }).pipe(
      catchError(() => {
        let items = [...DEMO_SERIES];
        if (query?.search) {
          const q = query.search.toLowerCase();
          items = items.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
        }
        return of({ items, total: items.length });
      })
    );
  }

  getSeriesById(id: string): Observable<SeriesDto | null> {
    return this.http.get<SeriesDto>(`${this.apiUrl}/series/${id}`).pipe(
      catchError(() => {
        const series = DEMO_SERIES.find((s) => s.id === id) ?? DEMO_SERIES[0];
        return of(series);
      })
    );
  }

  search(query: string): Observable<{ movies: MovieDto[]; series: SeriesDto[] }> {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      return of({ movies: [], series: [] });
    }

    return this.http
      .get<{ movies: MovieDto[]; series: SeriesDto[] }>(`${this.apiUrl}/search`, {
        params: new HttpParams().set('q', q),
      })
      .pipe(
        catchError(() => {
          const matchedMovies = DEMO_MOVIES.filter(
            (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
          );
          const matchedSeries = DEMO_SERIES.filter(
            (s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
          );
          return of({ movies: matchedMovies, series: matchedSeries });
        })
      );
  }
}
