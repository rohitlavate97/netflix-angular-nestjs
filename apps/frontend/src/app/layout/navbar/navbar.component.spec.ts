import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NavbarComponent } from './navbar.component';
import { ProfileService } from '../../core/services/profile.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([]), provideHttpClient(), ProfileService],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the navbar', () => {
    expect(component).toBeTruthy();
  });

  it('should display brand logo StreamFlix', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header')?.textContent).toContain('StreamFlix');
  });

  it('should toggle search input visibility', () => {
    expect(component.isSearchOpen()).toBeFalse();
    component.toggleSearch();
    expect(component.isSearchOpen()).toBeTrue();
  });

  it('should toggle notifications dropdown', () => {
    expect(component.isNotificationsOpen()).toBeFalse();
    component.toggleNotifications();
    expect(component.isNotificationsOpen()).toBeTrue();
    expect(component.isProfileMenuOpen()).toBeFalse();
  });

  it('should toggle profile menu dropdown', () => {
    expect(component.isProfileMenuOpen()).toBeFalse();
    component.toggleProfileMenu();
    expect(component.isProfileMenuOpen()).toBeTrue();
    expect(component.isNotificationsOpen()).toBeFalse();
  });

  it('should toggle mobile menu drawer', () => {
    expect(component.isMobileMenuOpen()).toBeFalse();
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen()).toBeTrue();
    component.closeMobileMenu();
    expect(component.isMobileMenuOpen()).toBeFalse();
  });

  it('should update scroll state on window scroll', () => {
    spyOnProperty(window, 'scrollY', 'get').and.returnValue(50);
    component.onWindowScroll();
    expect(component.isScrolled()).toBeTrue();
  });
});
