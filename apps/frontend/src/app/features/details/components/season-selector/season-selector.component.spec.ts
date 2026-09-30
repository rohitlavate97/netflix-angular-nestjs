import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeasonSelectorComponent } from './season-selector.component';
import { SeasonDto } from '@netflix/shared-types';

describe('SeasonSelectorComponent', () => {
  let component: SeasonSelectorComponent;
  let fixture: ComponentFixture<SeasonSelectorComponent>;

  const mockSeasons: SeasonDto[] = [
    {
      id: 'season-1',
      seriesId: 'series-1',
      seasonNumber: 1,
      title: 'Season 1: Inception',
      description: 'The beginning',
      episodes: [
        {
          id: 'ep-1',
          seasonId: 'season-1',
          episodeNumber: 1,
          title: 'Pilot',
          durationMinutes: 45,
          thumbnailUrl: 'https://example.com/ep1.jpg',
          description: 'The journey begins.',
        },
      ],
    },
    {
      id: 'season-2',
      seriesId: 'series-1',
      seasonNumber: 2,
      title: 'Season 2: Retribution',
      description: 'The climax',
      episodes: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeasonSelectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeasonSelectorComponent);
    component = fixture.componentInstance;
    component.seasons = mockSeasons;
    component.selectedSeasonId = 'season-1';
    fixture.detectChanges();
  });

  it('should create season selector component', () => {
    expect(component).toBeTruthy();
  });

  it('should render season options in select element', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('select');
    expect(select).toBeTruthy();
    const options = compiled.querySelectorAll('option');
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Season 1: Inception (1 Episodes)');
    expect(options[1].textContent).toContain('Season 2: Retribution (0 Episodes)');
  });

  it('should emit seasonSelect event when user selects a different season', () => {
    spyOn(component.seasonSelect, 'emit');
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'season-2';
    select.dispatchEvent(new Event('change'));

    expect(component.seasonSelect.emit).toHaveBeenCalledWith(mockSeasons[1]);
  });

  it('should render nothing when seasons array is empty', () => {
    component.seasons = [];
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    expect(select).toBeNull();
  });
});
