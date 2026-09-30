import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentCardComponent, CardContentItem } from './content-card.component';

describe('ContentCardComponent', () => {
  let component: ContentCardComponent;
  let fixture: ComponentFixture<ContentCardComponent>;

  const mockItem: CardContentItem = {
    id: 'test-1',
    title: 'Interstellar Drift',
    description: 'A deep journey through cosmic anomalies.',
    backdropUrl: 'https://example.com/backdrop.jpg',
    posterUrl: 'https://example.com/poster.jpg',
    ageRating: '16+',
    durationMinutes: 135,
    averageRating: 4.8,
    genres: [{ name: 'Sci-Fi', slug: 'sci-fi' }, { name: 'Drama', slug: 'drama' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentCardComponent);
    component = fixture.componentInstance;
    component.content = mockItem;
    fixture.detectChanges();
  });

  it('should create the content card', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and formatted duration', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Interstellar Drift');
    expect(compiled.textContent).toContain('2h 15m');
  });

  it('should compute match percentage', () => {
    expect(component.matchScore).toBe(96);
  });

  it('should format genre display with bullet points', () => {
    expect(component.genresDisplay).toBe('Sci-Fi • Drama');
  });

  it('should emit play event when play button clicked', () => {
    spyOn(component.play, 'emit');
    const event = new MouseEvent('click');
    component.onPlay(event);
    expect(component.play.emit).toHaveBeenCalledWith(mockItem);
  });

  it('should emit toggleWatchlist event when watchlist button clicked', () => {
    spyOn(component.toggleWatchlist, 'emit');
    const event = new MouseEvent('click');
    component.onToggleWatchlist(event);
    expect(component.toggleWatchlist.emit).toHaveBeenCalledWith(mockItem);
  });

  it('should emit details event when card clicked', () => {
    spyOn(component.details, 'emit');
    component.onCardClick();
    expect(component.details.emit).toHaveBeenCalledWith(mockItem);
  });
});
