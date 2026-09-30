import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ContentDetailsComponent } from './content-details.component';
import { ContentService } from '../../core/services/content.service';
import { WatchHistoryService } from '../../core/services/watch-history.service';
import { ProfileService } from '../../core/services/profile.service';
import { MovieDto, SeriesDto, SeasonDto, ContentStatus } from '@netflix/shared-types';


describe('ContentDetailsComponent', () => {
  let component: ContentDetailsComponent;
  let fixture: ComponentFixture<ContentDetailsComponent>;
  let contentService: ContentService;
  let router: Router;

  const mockMovie: MovieDto = {
    id: 'movie-10',
    title: 'Quantum Paradox',
    slug: 'quantum-paradox',
    description: 'A theoretical physicist discovers an anomaly in space-time.',
    releaseDate: '2025-06-15',
    durationMinutes: 130,
    ageRating: '16+',
    language: 'English',
    country: 'United States',
    posterUrl: 'https://example.com/poster.jpg',
    backdropUrl: 'https://example.com/backdrop.jpg',
    genres: [{ id: 'g1', name: 'Sci-Fi', slug: 'sci-fi' }],
    status: 'PUBLISHED' as ContentStatus,
    viewCount: 500000,
    averageRating: 4.8,
  };

  const mockSeries: SeriesDto = {
    id: 'series-10',
    title: 'Neural Matrix',
    slug: 'neural-matrix',
    description: 'Human minds connected across an omnipresent neural web.',
    releaseDate: '2024-11-01',
    ageRating: '18+',
    language: 'English',
    posterUrl: 'https://example.com/matrix-poster.jpg',
    backdropUrl: 'https://example.com/matrix-backdrop.jpg',
    genres: [{ id: 'g2', name: 'Cyberpunk', slug: 'cyberpunk' }],
    status: 'PUBLISHED' as ContentStatus,
    averageRating: 4.9,
    seasons: [
      {
        id: 's-1',
        seriesId: 'series-10',
        seasonNumber: 1,
        title: 'Season 1: Initialization',
        description: 'The grid awakens',
        episodes: [
          {
            id: 'ep-1',
            seasonId: 's-1',
            episodeNumber: 1,
            title: 'Protocol Zero',
            durationMinutes: 50,
            thumbnailUrl: 'https://example.com/ep1.jpg',
            description: 'The first hack.',
          },
        ],
      },
      {
        id: 's-2',
        seriesId: 'series-10',
        seasonNumber: 2,
        title: 'Season 2: Overclock',
        description: 'The grid fights back',
        episodes: [
          {
            id: 'ep-2',
            seasonId: 's-2',
            episodeNumber: 1,
            title: 'System Crash',
            durationMinutes: 55,
            thumbnailUrl: 'https://example.com/ep2.jpg',
            description: 'The system collapses.',
          },
        ],
      },
    ],
  };

  let watchHistoryService: WatchHistoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentDetailsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        ContentService,
        WatchHistoryService,
        ProfileService,
      ],
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    watchHistoryService = TestBed.inject(WatchHistoryService);
    router = TestBed.inject(Router);

    spyOn(contentService, 'getMovies').and.returnValue(
      of({ items: [mockMovie], total: 1, page: 1, limit: 10, totalPages: 1 })
    );
    spyOn(watchHistoryService, 'getResumePlayback').and.returnValue(
      of({
        contentId: 'movie-10',
        positionSeconds: 0,
        durationSeconds: 7800,
        progressPercentage: 0,
        completed: false,
      })
    );

    fixture = TestBed.createComponent(ContentDetailsComponent);
    component = fixture.componentInstance;
  });


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load movie details and format metadata', () => {
    spyOn(contentService, 'getContentById').and.returnValue(of(mockMovie));
    component.id = 'movie-10';
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeFalse();
    expect(component.content()?.title).toBe('Quantum Paradox');
    expect(component.isSeries()).toBeFalse();
    expect(component.durationString).toBe('2h 10m');
    expect(component.releaseYear).toBe('2025');
    expect(component.matchScore).toBe(96);
  });

  it('should load series details and initialize first season', () => {
    spyOn(contentService, 'getContentById').and.returnValue(of(mockSeries));
    component.id = 'series-10';
    fixture.detectChanges();

    expect(component.isSeries()).toBeTrue();
    expect(component.seasonsList().length).toBe(2);
    expect(component.selectedSeason()?.id).toBe('s-1');
    expect(component.currentEpisodes().length).toBe(1);
    expect(component.durationString).toBe('2 Seasons');
  });

  it('should switch selected season and update episodes', () => {
    spyOn(contentService, 'getContentById').and.returnValue(of(mockSeries));
    component.id = 'series-10';
    fixture.detectChanges();

    const season2: SeasonDto = mockSeries.seasons![1];
    component.onSeasonSelect(season2);

    expect(component.selectedSeason()?.id).toBe('s-2');
    expect(component.currentEpisodes()[0].title).toBe('System Crash');
  });

  it('should handle error when getContentById fails', () => {
    spyOn(contentService, 'getContentById').and.returnValue(
      throwError(() => new Error('Not found'))
    );
    component.id = 'invalid-id';
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeTrue();
  });

  it('should toggle watchlist signal status', () => {
    spyOn(contentService, 'getContentById').and.returnValue(of(mockMovie));
    component.id = 'movie-10';
    fixture.detectChanges();

    expect(component.isWatchlisted()).toBeFalse();
    component.toggleWatchlist();
    expect(component.isWatchlisted()).toBeTrue();
    component.toggleWatchlist();
    expect(component.isWatchlisted()).toBeFalse();
  });

  it('should navigate to watch player on onPlay', () => {
    spyOn(contentService, 'getContentById').and.returnValue(of(mockMovie));
    const navSpy = spyOn(router, 'navigate');
    component.id = 'movie-10';
    fixture.detectChanges();

    component.onPlay();
    expect(navSpy).toHaveBeenCalledWith(['/watch', 'movie-10']);
  });

  it('should navigate to watch player with episode query param on onPlayEpisode', () => {
    spyOn(contentService, 'getContentById').and.returnValue(of(mockSeries));
    const navSpy = spyOn(router, 'navigate');
    component.id = 'series-10';
    fixture.detectChanges();

    const episode = mockSeries.seasons![0].episodes![0];
    component.onPlayEpisode(episode);
    expect(navSpy).toHaveBeenCalledWith(['/watch', 'series-10'], {
      queryParams: { episode: 'ep-1' },
    });
  });

  it('should navigate to home on goBack', () => {
    const navSpy = spyOn(router, 'navigate');
    component.goBack();
    expect(navSpy).toHaveBeenCalledWith(['/']);
  });

  it('should update route and reload on onSelectSimilar', () => {
    spyOn(contentService, 'getContentById').and.returnValue(of(mockMovie));
    const navSpy = spyOn(router, 'navigate');
    component.id = 'movie-10';
    fixture.detectChanges();

    component.onSelectSimilar('similar-id');
    expect(navSpy).toHaveBeenCalledWith(['/title', 'similar-id']);
    expect(component.id).toBe('similar-id');
  });
});
