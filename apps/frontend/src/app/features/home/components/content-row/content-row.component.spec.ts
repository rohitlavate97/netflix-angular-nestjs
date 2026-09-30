import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentRowComponent } from './content-row.component';
import { MovieDto, ContentStatus } from '@netflix/shared-types';

describe('ContentRowComponent', () => {
  let component: ContentRowComponent;
  let fixture: ComponentFixture<ContentRowComponent>;

  const mockMovies: MovieDto[] = [
    {
      id: 'row-1',
      title: 'Neon Odyssey',
      slug: 'neon-odyssey',
      description: 'A neon-lit cyber run.',
      releaseDate: '2025-01-01',
      durationMinutes: 110,
      ageRating: '13+',
      language: 'English',
      country: 'USA',
      posterUrl: 'https://example.com/p1.jpg',
      backdropUrl: 'https://example.com/b1.jpg',
      genres: [{ id: '1', name: 'Action', slug: 'action' }],
      status: 'PUBLISHED' as ContentStatus,
      viewCount: 50000,
      averageRating: 4.5,
    },
    {
      id: 'row-2',
      title: 'Cyber Drift',
      slug: 'cyber-drift',
      description: 'Underground cyber speed.',
      releaseDate: '2025-02-01',
      durationMinutes: 95,
      ageRating: '16+',
      language: 'English',
      country: 'Japan',
      posterUrl: 'https://example.com/p2.jpg',
      backdropUrl: 'https://example.com/b2.jpg',
      genres: [{ id: '2', name: 'Sci-Fi', slug: 'sci-fi' }],
      status: 'PUBLISHED' as ContentStatus,
      viewCount: 60000,
      averageRating: 4.7,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentRowComponent);
    component = fixture.componentInstance;
    component.title = 'Trending Now';
    component.items = mockMovies;
    fixture.detectChanges();
  });

  it('should create content row', () => {
    expect(component).toBeTruthy();
  });

  it('should render row title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Trending Now');
  });

  it('should compute watchlisted status correctly', () => {
    component.watchlistedIds = new Set(['row-1']);
    expect(component.isItemWatchlisted('row-1')).toBeTrue();
    expect(component.isItemWatchlisted('row-2')).toBeFalse();
  });

  it('should emit onPlay event when item is played', () => {
    spyOn(component.play, 'emit');
    component.onPlay('row-1');
    expect(component.play.emit).toHaveBeenCalledWith('row-1');
  });

  it('should emit onToggleWatchlist event', () => {
    spyOn(component.toggleWatchlist, 'emit');
    component.onToggleWatchlist('row-2');
    expect(component.toggleWatchlist.emit).toHaveBeenCalledWith('row-2');
  });

  it('should emit onDetails event with movie data', () => {
    spyOn(component.openDetails, 'emit');
    component.onDetails(mockMovies[0]);
    expect(component.openDetails.emit).toHaveBeenCalledWith(mockMovies[0]);
  });
});
