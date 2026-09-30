import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient()],
    });
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set demo session and update reactive signals', () => {
    expect(service.isAuthenticated()).toBeFalse();
    service.setDemoSession();
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.email).toBe('demo@streamflix.local');
  });

  it('should clear signals and local storage on logout', () => {
    service.setDemoSession();
    expect(service.isAuthenticated()).toBeTrue();

    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(service.accessToken()).toBeNull();
  });
});
