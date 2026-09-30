import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CastListComponent } from './cast-list.component';
import { GenreDto } from '@netflix/shared-types';

describe('CastListComponent', () => {
  let component: CastListComponent;
  let fixture: ComponentFixture<CastListComponent>;

  const mockGenres: GenreDto[] = [
    { id: 'g1', name: 'Cyberpunk', slug: 'cyberpunk' },
    { id: 'g2', name: 'Action', slug: 'action' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CastListComponent);
    component = fixture.componentInstance;
    component.genres = mockGenres;
    fixture.detectChanges();
  });

  it('should create cast list component', () => {
    expect(component).toBeTruthy();
  });

  it('should render default cast members when custom cast is empty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Elena Rostova');
    expect(compiled.textContent).toContain('Marcus Vance');
  });

  it('should render custom cast members when provided', () => {
    component.cast = ['John David Washington', 'Robert Pattinson', 'Elizabeth Debicki'];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('John David Washington');
    expect(compiled.textContent).toContain('Robert Pattinson');
    expect(compiled.textContent).not.toContain('Elena Rostova');
  });

  it('should render genres and director information', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Cyberpunk');
    expect(compiled.textContent).toContain('Action');
    expect(compiled.textContent).toContain('Christopher Nolan');
  });

  it('should render content advisory maturity tags', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sci-Fi Violence');
    expect(compiled.textContent).toContain('Strong Language');
  });
});
