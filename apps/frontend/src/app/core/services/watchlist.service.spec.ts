import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WatchlistService } from './watchlist.service';
import { ProfileService } from './profile.service';
import { ContentService } from './content.service';
import { WatchlistItemDto, WatchlistResponseDto } from '@netflix/shared-types';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let httpMock: HttpTestingController;

  const mockItem: WatchlistItemDto = {
    id: 'w-1',
    profileId: 'p-1',
    movieId: 'm-1',
    createdAt: new Date().toISOString(),
  };

  const mockResponse: WatchlistResponseDto = {
    items: [mockItem],
    total: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WatchlistService,
        ProfileService,
        ContentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(WatchlistService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch watchlist and update signal', () => {
    service.loadWatchlist('p-1').subscribe((items) => {
      expect(items.length).toBe(1);
      expect(items[0].movieId).toBe('m-1');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/watchlist') && r.params.get('profileId') === 'p-1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.watchlistItems().length).toBe(1);
    expect(service.isWatchlisted('m-1')).toBeTrue();
  });

  it('should add item to watchlist optimistically and call API', () => {
    service.addToWatchlist('m-2', 'movie', 'p-1').subscribe();

    expect(service.isWatchlisted('m-2')).toBeTrue();

    const req = httpMock.expectOne((r) => r.url.includes('/watchlist') && r.method === 'POST');
    expect(req.request.body).toEqual({
      profileId: 'p-1',
      contentId: 'm-2',
      contentType: 'movie',
    });
    req.flush({ id: 'w-2', profileId: 'p-1', movieId: 'm-2', createdAt: new Date().toISOString() });
  });

  it('should remove item from watchlist optimistically and call API', () => {
    service.watchlistItems.set([mockItem]);
    expect(service.isWatchlisted('m-1')).toBeTrue();

    service.removeFromWatchlist('m-1', 'p-1').subscribe();

    expect(service.isWatchlisted('m-1')).toBeFalse();

    const req = httpMock.expectOne((r) => r.url.includes('/watchlist/p-1/m-1') && r.method === 'DELETE');
    req.flush({ success: true });
  });

  it('should toggle watchlist status from false to true and back', () => {
    service.watchlistItems.set([]);

    service.toggleWatchlist('m-1', 'movie', 'p-1').subscribe();
    expect(service.isWatchlisted('m-1')).toBeTrue();
    const req1 = httpMock.expectOne((r) => r.method === 'POST');
    req1.flush(mockItem);

    service.toggleWatchlist('m-1', 'movie', 'p-1').subscribe();
    expect(service.isWatchlisted('m-1')).toBeFalse();
    const req2 = httpMock.expectOne((r) => r.method === 'DELETE');
    req2.flush({ success: true });
  });
});
