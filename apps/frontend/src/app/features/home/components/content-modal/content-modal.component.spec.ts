import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentModalComponent } from './content-modal.component';
import { MovieDto, ContentStatus } from '@netflix/shared-types';

describe('ContentModalComponent', () => {
  let component: ContentModalComponent;
  let fixture: ComponentFixture<ContentModalComponent>;

  const mockMovie: MovieDto = {
    id: 'modal-movie-1',
    title: 'The Neural Grid',
    slug: 'the-neural-grid',
    description: 'A deep exploration into machine consciousness and neural interfaces.',
    releaseDate: '2025-06-15',
    durationMinutes: 135,
    ageRating: '16+',
    language: 'English',
    country: 'USA',
    posterUrl: 'https://example.com/p.jpg',
    backdropUrl: 'https://example.com/b.jpg',
    genres: [{ id: '1', name: 'Sci-Fi', slug: 'sci-fi' }, { id: '2', name: 'Thriller', slug: 'thriller' }],
    status: 'PUBLISHED' as ContentStatus,
    viewCount: 150000,
    averageRating: 4.8,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentModalComponent);
    component = fixture.componentInstance;
    component.isOpen = true;
    component.content = mockMovie;
    fixture.detectChanges();
  });

  it('should create content modal', () => {
    expect(component).toBeTruthy();
  });

  it('should render title, description, and match score when open', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('The Neural Grid');
    expect(compiled.textContent).toContain('A deep exploration');
    expect(compiled.textContent).toContain('96% Match');
  });

  it('should compute formatted duration string', () => {
    expect(component.durationString).toBe('2h 15m');
  });

  it('should emit close event on close button click', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should emit play event with movie ID', () => {
    spyOn(component.play, 'emit');
    component.onPlay();
    expect(component.play.emit).toHaveBeenCalledWith('modal-movie-1');
  });

  it('should emit toggleWatchlist event with movie ID', () => {
    spyOn(component.toggleWatchlist, 'emit');
    component.onToggleWatchlist();
    expect(component.toggleWatchlist.emit).toHaveBeenCalledWith('modal-movie-1');
  });

  it('should close modal on escape key press', () => {
    spyOn(component.close, 'emit');
    component.onEscape();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
