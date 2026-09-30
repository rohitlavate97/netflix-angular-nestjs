import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroBannerComponent } from './hero-banner.component';
import { MovieDto, ContentStatus } from '@netflix/shared-types';

describe('HeroBannerComponent', () => {
  let component: HeroBannerComponent;
  let fixture: ComponentFixture<HeroBannerComponent>;

  const mockMovie: MovieDto = {
    id: 'hero-1',
    title: 'The Stellar Void',
    slug: 'the-stellar-void',
    description: 'Beyond all known stars lies a forgotten cosmic civilization.',
    releaseDate: '2025-10-10',
    durationMinutes: 140,
    ageRating: '16+',
    language: 'English',
    country: 'United States',
    posterUrl: 'https://example.com/poster.jpg',
    backdropUrl: 'https://example.com/backdrop.jpg',
    genres: [{ id: '1', name: 'Sci-Fi', slug: 'sci-fi' }],
    status: 'PUBLISHED' as ContentStatus,
    viewCount: 1000000,
    averageRating: 4.9,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroBannerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroBannerComponent);
    component = fixture.componentInstance;
    component.content = mockMovie;
    fixture.detectChanges();
  });

  it('should create hero banner', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('The Stellar Void');
    expect(compiled.textContent).toContain('Beyond all known stars');
  });

  it('should emit play event when Play button is clicked', () => {
    spyOn(component.play, 'emit');
    component.onPlay();
    expect(component.play.emit).toHaveBeenCalledWith('hero-1');
  });

  it('should emit moreInfo event when More Info button is clicked', () => {
    spyOn(component.moreInfo, 'emit');
    component.onMoreInfo();
    expect(component.moreInfo.emit).toHaveBeenCalledWith(mockMovie);
  });

  it('should toggle mute state on audio button click', () => {
    expect(component.isMuted()).toBeTrue();
    component.onToggleMute();
    expect(component.isMuted()).toBeFalse();
    component.onToggleMute();
    expect(component.isMuted()).toBeTrue();
  });
});
