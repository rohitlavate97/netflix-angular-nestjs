import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the empty state component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and description', () => {
    component.title = 'No Results Found';
    component.description = 'Try searching with different keywords.';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No Results Found');
    expect(compiled.textContent).toContain('Try searching with different keywords.');
  });

  it('should emit actionClick when action button is clicked', () => {
    component.actionLabel = 'Explore';
    fixture.detectChanges();

    spyOn(component.actionClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.actionClick.emit).toHaveBeenCalled();
  });
});
