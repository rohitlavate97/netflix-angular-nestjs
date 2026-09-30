import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the footer', () => {
    expect(component).toBeTruthy();
  });

  it('should render customer support phone number', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1-800-STREAMFLIX');
  });

  it('should render essential legal and service links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Help Center');
    expect(compiled.textContent).toContain('Terms of Use');
    expect(compiled.textContent).toContain('Privacy');
  });

  it('should generate a service code on button click', () => {
    expect(component.serviceCode()).toBeNull();
    component.generateServiceCode();
    expect(component.serviceCode()).toMatch(/^\d{3}-\d{3}$/);
  });
});
