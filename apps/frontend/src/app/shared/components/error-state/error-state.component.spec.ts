import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  let component: ErrorStateComponent;
  let fixture: ComponentFixture<ErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the error state component', () => {
    expect(component).toBeTruthy();
  });

  it('should render default title and message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Something went wrong');
    expect(compiled.textContent).toContain('We encountered an error loading this section');
  });

  it('should emit retry event when retry button is clicked', () => {
    spyOn(component.retry, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.retry.emit).toHaveBeenCalled();
  });
});
