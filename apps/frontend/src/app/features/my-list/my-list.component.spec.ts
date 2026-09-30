import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { MyListComponent } from './my-list.component';
import { WatchlistService } from '../../core/services/watchlist.service';
import { ProfileService } from '../../core/services/profile.service';
import { WatchlistItemDto, ContentStatus } from '@netflix/shared-types';

describe('MyListComponent', () => {
  let component: MyListComponent;
  let fixture: ComponentFixture<MyListComponent>;
  let watchlistService: WatchlistService;
  let router: Router;

  const mockMovieItem: WatchlistItemDto = {
    id: 'w-1',
    profileId: 'p-1',
    movieId: 'm-1',
    createdAt: '2025-01-01T00:00:00.000Z',
    movie: {
      id: 'm-1',
      title: 'Shadow Protocol',
      slug: 'shadow-protocol',
      description: 'An elite operative...',
      releaseDate: '2025-01-01',
      durationMinutes: 128,
      ageRating: '16+',
      language: 'English',
      country: 'USA',
      posterUrl: 'poster.jpg',
      backdropUrl: 'backdrop.jpg',
      genres: [],
      status: 'PUBLISHED' as ContentStatus,
      viewCount: 1000,
      averageRating: 4.8,
    },
  };

  const mockSeriesItem: WatchlistItemDto = {
    id: 'w-2',
    profileId: 'p-1',
    seriesId: 's-1',
    createdAt: '2025-02-01T00:00:00.000Z',
    series: {
      id: 's-1',
      title: 'The Neural Grid',
      slug: 'the-neural-grid',
      description: 'Humanity meets machines...',
      releaseDate: '2024-03-01',
      ageRating: '18+',
      language: 'English',
      posterUrl: 'poster.jpg',
      backdropUrl: 'backdrop.jpg',
      genres: [],
      status: 'PUBLISHED' as ContentStatus,
      seasons: [],
      averageRating: 4.9,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyListComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        WatchlistService,
        ProfileService,
      ],
    }).compileComponents();

    watchlistService = TestBed.inject(WatchlistService);
    router = TestBed.inject(Router);

    spyOn(watchlistService, 'loadWatchlist').and.returnValue(
      of([mockMovieItem, mockSeriesItem]),
    );

    fixture = TestBed.createComponent(MyListComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render items in success grid', () => {
    watchlistService.watchlistItems.set([mockMovieItem, mockSeriesItem]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Shadow Protocol');
    expect(compiled.textContent).toContain('The Neural Grid');
    expect(component.displayedItems().length).toBe(2);
  });

  it('should filter items by content type', () => {
    watchlistService.watchlistItems.set([mockMovieItem, mockSeriesItem]);
    fixture.detectChanges();

    component.setFilter('movie');
    expect(component.displayedItems().length).toBe(1);
    expect(component.displayedItems()[0].movieId).toBe('m-1');

    component.setFilter('series');
    expect(component.displayedItems().length).toBe(1);
    expect(component.displayedItems()[0].seriesId).toBe('s-1');

    component.setFilter('all');
    expect(component.displayedItems().length).toBe(2);
  });

  it('should sort items by title and rating', () => {
    watchlistService.watchlistItems.set([mockMovieItem, mockSeriesItem]);
    fixture.detectChanges();

    const eventTitle = { target: { value: 'title' } } as unknown as Event;
    component.onSortChange(eventTitle);
    expect(component.displayedItems()[0].movie?.title).toBe('Shadow Protocol');

    const eventRating = { target: { value: 'rating' } } as unknown as Event;
    component.onSortChange(eventRating);
    expect(component.displayedItems()[0].series?.title).toBe('The Neural Grid');
  });

  it('should remove item when removeFromList is called', () => {
    const removeSpy = spyOn(watchlistService, 'removeFromWatchlist').and.returnValue(of(true));
    component.removeFromList(mockMovieItem);
    expect(removeSpy).toHaveBeenCalledWith('m-1');
  });

  it('should navigate to /watch/:id on playItem', () => {
    const navSpy = spyOn(router, 'navigate');
    component.playItem(mockMovieItem);
    expect(navSpy).toHaveBeenCalledWith(['/watch', 'm-1']);
  });

  it('should navigate to /title/:id on openDetails', () => {
    const navSpy = spyOn(router, 'navigate');
    component.openDetails(mockMovieItem);
    expect(navSpy).toHaveBeenCalledWith(['/title', 'm-1']);
  });

  it('should navigate to browse on goToBrowse', () => {
    const navSpy = spyOn(router, 'navigate');
    component.goToBrowse();
    expect(navSpy).toHaveBeenCalledWith(['/movies']);
  });

  it('should render empty state when watchlist is empty', () => {
    watchlistService.watchlistItems.set([]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Your list is empty');
  });
});
