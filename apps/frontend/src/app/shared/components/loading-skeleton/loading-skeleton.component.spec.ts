import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSkeletonComponent } from './loading-skeleton.component';

describe('LoadingSkeletonComponent', () => {
  let component: LoadingSkeletonComponent;
  let fixture: ComponentFixture<LoadingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the loading skeleton', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default counter array of 6 items', () => {
    expect(component.counterArray.length).toBe(6);
  });

  it('should update counter array when count input changes', () => {
    component.count = 12;
    expect(component.counterArray.length).toBe(12);
  });

  it('should render shimmer elements for row type', () => {
    component.type = 'row';
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.skeleton-shimmer').length).toBe(6);
  });
});
