import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HomeComponent } from './home.component';
import { ContentService } from '../../core/services/content.service';
import { ProfileService } from '../../core/services/profile.service';
import { ContentCategoryRowDto, ContentStatus } from '@netflix/shared-types';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let contentService: ContentService;

  const mockRows: ContentCategoryRowDto[] = [
    {
      category: { id: 'c1', name: 'Trending Now', slug: 'trending-now', displayOrder: 1, isActive: true },
      movies: [
        {
          id: 'm1',
          title: 'Stellar Wind',
          slug: 'stellar-wind',
          description: 'A deep voyage.',
          releaseDate: '2025-01-01',
          durationMinutes: 120,
          ageRating: '16+',
          language: 'English',
          country: 'USA',
          posterUrl: 'https://example.com/p1.jpg',
          backdropUrl: 'https://example.com/b1.jpg',
          genres: [],
          status: 'PUBLISHED' as ContentStatus,
          viewCount: 1000,
          averageRating: 4.8,
        },
      ],
      series: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        ContentService,
        ProfileService,
      ],
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    spyOn(contentService, 'getHomeFeed').and.returnValue(of(mockRows));

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create home component', () => {
    expect(component).toBeTruthy();
  });

  it('should load home feed and set hero content', () => {
    expect(component.isLoading()).toBeFalse();
    expect(component.categoryRows().length).toBe(1);
    expect(component.heroContent()?.title).toBe('Stellar Wind');
  });

  it('should open and close details modal', () => {
    expect(component.isModalOpen()).toBeFalse();
    component.openDetailsModal(mockRows[0].movies[0]);
    expect(component.isModalOpen()).toBeTrue();
    expect(component.selectedModalContent()?.id).toBe('m1');

    component.closeModal();
    expect(component.isModalOpen()).toBeFalse();
    expect(component.selectedModalContent()).toBeNull();
  });

  it('should toggle watchlist item presence', () => {
    component.toggleWatchlist('m1');
    expect(component.watchlistedIds().has('m1')).toBeTrue();
    component.toggleWatchlist('m1');
    expect(component.watchlistedIds().has('m1')).toBeFalse();
  });
});
