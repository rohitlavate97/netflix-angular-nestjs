import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EpisodePickerComponent } from './episode-picker.component';
import { EpisodeDto } from '@netflix/shared-types';

describe('EpisodePickerComponent', () => {
  let component: EpisodePickerComponent;
  let fixture: ComponentFixture<EpisodePickerComponent>;

  const mockEpisodes: EpisodeDto[] = [
    {
      id: 'ep-1',
      seasonId: 'season-1',
      episodeNumber: 1,
      title: 'Chapter 1: The Awakening',
      durationMinutes: 48,
      thumbnailUrl: 'https://example.com/ep1.jpg',
      description: 'A mysterious signal disrupts subterranean communication networks.',
    },
    {
      id: 'ep-2',
      seasonId: 'season-1',
      episodeNumber: 2,
      title: 'Chapter 2: The Grid',
      durationMinutes: 52,
      thumbnailUrl: 'https://example.com/ep2.jpg',
      description: 'Special operative Marcus tracks the encrypted source.',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EpisodePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EpisodePickerComponent);
    component = fixture.componentInstance;
    component.episodes = mockEpisodes;
    fixture.detectChanges();
  });

  it('should create episode picker component', () => {
    expect(component).toBeTruthy();
  });

  it('should render all episodes with title, duration, and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Chapter 1: The Awakening');
    expect(compiled.textContent).toContain('48m');
    expect(compiled.textContent).toContain('Chapter 2: The Grid');
    expect(compiled.textContent).toContain('52m');
  });

  it('should emit playEpisode event when an episode card is clicked', () => {
    spyOn(component.playEpisode, 'emit');
    const episodeRow = fixture.nativeElement.querySelector('.group') as HTMLElement;
    expect(episodeRow).toBeTruthy();
    episodeRow.click();

    expect(component.playEpisode.emit).toHaveBeenCalledWith(mockEpisodes[0]);
  });

  it('should display empty message when no episodes are present', () => {
    component.episodes = [];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No episodes currently available for this season.');
  });
});
