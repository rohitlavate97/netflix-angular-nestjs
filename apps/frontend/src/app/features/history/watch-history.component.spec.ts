import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WatchHistoryComponent } from './watch-history.component';
import { WatchHistoryService } from '../../core/services/watch-history.service';
import { ProfileService } from '../../core/services/profile.service';
import { WatchHistoryItemDto, ContentStatus } from '@netflix/shared-types';



describe('WatchHistoryComponent', () => {
  let component: WatchHistoryComponent;
  let fixture: ComponentFixture<WatchHistoryComponent>;
  let watchHistoryService: WatchHistoryService;

  const mockHistoryItems: WatchHistoryItemDto[] = [
    {
      id: 'wh-1',
      profileId: 'p-1',
      movieId: 'm-1',
      movie: {
        id: 'm-1',
        title: 'Shadow Protocol',
        slug: 'shadow-protocol',
        description: 'Cyber thriller',
        releaseDate: '2025-01-01',
        durationMinutes: 120,
        ageRating: '16+',
        language: 'English',
        country: 'USA',
        posterUrl: 'poster.jpg',
        backdropUrl: 'backdrop.jpg',
        status: 'PUBLISHED' as ContentStatus,
        viewCount: 1000,
        averageRating: 4.8,
        genres: [],
      },
      positionSeconds: 1200,
      durationSeconds: 7200,
      progressPercentage: 16.67,
      completed: false,
      lastWatchedAt: '2026-01-01T12:00:00Z',
      createdAt: '2026-01-01T12:00:00Z',
      updatedAt: '2026-01-01T12:00:00Z',
    },
    {
      id: 'wh-2',
      profileId: 'p-1',
      episodeId: 'ep-1',
      episode: {
        id: 'ep-1',
        seasonId: 's-1',
        episodeNumber: 2,
        title: 'The Outpost',
        durationMinutes: 45,
        thumbnailUrl: 'thumb.jpg',
        seriesTitle: 'Stranger Dimensions',
        seasonNumber: 1,
      },
      positionSeconds: 2700,
      durationSeconds: 2700,
      progressPercentage: 100,
      completed: true,
      lastWatchedAt: '2026-01-02T12:00:00Z',
      createdAt: '2026-01-02T12:00:00Z',
      updatedAt: '2026-01-02T12:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchHistoryComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        WatchHistoryService,
        ProfileService,
      ],
    }).compileComponents();

    watchHistoryService = TestBed.inject(WatchHistoryService);
    spyOn(watchHistoryService, 'loadWatchHistory').and.returnValue(
      of({
        items: mockHistoryItems,
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
    );

    fixture = TestBed.createComponent(WatchHistoryComponent);
    component = fixture.componentInstance;
    watchHistoryService.watchHistoryList.set(mockHistoryItems);
    fixture.detectChanges();
  });

  it('should create watch history component', () => {
    expect(component).toBeTruthy();
  });

  it('should load history and display all items initially', () => {
    expect(component.isLoading()).toBeFalse();
    expect(component.allItems().length).toBe(2);
    expect(component.filteredItems().length).toBe(2);
  });

  it('should filter items by in-progress and completed', () => {
    component.setFilter('in-progress');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].id).toBe('wh-1');

    component.setFilter('completed');
    expect(component.filteredItems().length).toBe(1);
    expect(component.filteredItems()[0].id).toBe('wh-2');

    component.setFilter('all');
    expect(component.filteredItems().length).toBe(2);
  });

  it('should format title and subtitle correctly for movies and series', () => {
    expect(component.getItemTitle(mockHistoryItems[0])).toBe('Shadow Protocol');
    expect(component.getItemSubtitle(mockHistoryItems[0])).toBeNull();

    expect(component.getItemTitle(mockHistoryItems[1])).toBe('Stranger Dimensions');
    expect(component.getItemSubtitle(mockHistoryItems[1])).toBe('S1:E2 The Outpost');
  });

  it('should remove item when requested', () => {
    const removeSpy = spyOn(watchHistoryService, 'removeFromHistory').and.returnValue(of(true));
    component.removeItem('wh-1');
    expect(removeSpy).toHaveBeenCalledWith('wh-1', jasmine.anything());
    expect(component.feedbackMessage()).toContain('hidden');
  });

  it('should prompt and clear all history', () => {
    component.promptClearHistory();
    expect(component.isConfirmingClear()).toBeTrue();

    const clearSpy = spyOn(watchHistoryService, 'clearHistory').and.returnValue(of(true));
    component.confirmClearHistory();
    expect(clearSpy).toHaveBeenCalled();
    expect(component.isConfirmingClear()).toBeFalse();
    expect(component.feedbackMessage()).toContain('cleared');
  });

  it('should handle error when loading fails', () => {
    (watchHistoryService.loadWatchHistory as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Server error')),
    );
    component.loadHistory();
    expect(component.hasError()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });
});
