import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WatchHistoryService } from './watch-history.service';
import { ProfileService } from './profile.service';
import { signal } from '@angular/core';

describe('WatchHistoryService', () => {
  let service: WatchHistoryService;
  let httpMock: HttpTestingController;

  const mockProfile = { id: 'prof-test-1', name: 'Rohit' };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WatchHistoryService,
        {
          provide: ProfileService,
          useValue: {
            currentProfile: signal(mockProfile),
          },
        },
      ],
    });

    service = TestBed.inject(WatchHistoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load continue watching list from API', () => {
    const mockCwItems = [
      {
        id: 'wh-1',
        profileId: 'prof-test-1',
        contentId: 'm-1',
        title: 'Shadow Protocol',
        posterUrl: 'poster.jpg',
        backdropUrl: 'backdrop.jpg',
        isSeries: false,
        positionSeconds: 600,
        durationSeconds: 3600,
        progressPercentage: 16.67,
        remainingMinutes: 50,
        completed: false,
        lastWatchedAt: new Date().toISOString(),
      },
    ];

    service.loadContinueWatching('prof-test-1').subscribe((items) => {
      expect(items.length).toBe(1);
      expect(service.continueWatchingList().length).toBe(1);
      expect(service.continueWatchingList()[0].title).toBe('Shadow Protocol');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/api/v1/watch-history/continue-watching'));
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { items: mockCwItems, total: 1 } });
  });

  it('should report progress and update continue watching optimistically', () => {
    service.continueWatchingList.set([
      {
        id: 'wh-1',
        profileId: 'prof-test-1',
        contentId: 'm-1',
        title: 'Shadow Protocol',
        posterUrl: 'poster.jpg',
        backdropUrl: 'backdrop.jpg',
        isSeries: false,
        movieId: 'm-1',
        positionSeconds: 100,
        durationSeconds: 1000,
        progressPercentage: 10,
        remainingMinutes: 15,
        completed: false,
        lastWatchedAt: new Date().toISOString(),
      },
    ]);

    service.reportProgress({
      profileId: 'prof-test-1',
      movieId: 'm-1',
      positionSeconds: 500,
      durationSeconds: 1000,
    });

    const updated = service.continueWatchingList();
    expect(updated[0].positionSeconds).toBe(500);
    expect(updated[0].progressPercentage).toBe(50);

    const req = httpMock.expectOne((r) => r.url.includes('/api/v1/watch-history/progress'));
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { id: 'wh-1' } });
  });

  it('should remove item from history optimistically', () => {
    service.continueWatchingList.set([
      {
        id: 'wh-remove',
        profileId: 'prof-test-1',
        contentId: 'm-1',
        title: 'To Remove',
        posterUrl: 'poster.jpg',
        backdropUrl: 'backdrop.jpg',
        isSeries: false,
        positionSeconds: 100,
        durationSeconds: 1000,
        progressPercentage: 10,
        remainingMinutes: 15,
        completed: false,
        lastWatchedAt: new Date().toISOString(),
      },
    ]);

    service.removeFromHistory('wh-remove', 'prof-test-1').subscribe((res) => {
      expect(res).toBe(true);
      expect(service.continueWatchingList().length).toBe(0);
    });

    const req = httpMock.expectOne((r) => r.url.includes('/api/v1/watch-history/wh-remove'));
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });

  it('should clear history and reset signals', () => {
    service.continueWatchingList.set([
      {
        id: 'wh-1',
        profileId: 'prof-test-1',
        contentId: 'm-1',
        title: 'Item',
        posterUrl: 'poster.jpg',
        backdropUrl: 'backdrop.jpg',
        isSeries: false,
        positionSeconds: 100,
        durationSeconds: 1000,
        progressPercentage: 10,
        remainingMinutes: 15,
        completed: false,
        lastWatchedAt: new Date().toISOString(),
      },
    ]);

    service.clearHistory('prof-test-1').subscribe((res) => {
      expect(res).toBe(true);
      expect(service.continueWatchingList().length).toBe(0);
      expect(service.watchHistoryList().length).toBe(0);
    });

    const req = httpMock.expectOne((r) => r.url.includes('/api/v1/watch-history/profile/prof-test-1'));
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});
