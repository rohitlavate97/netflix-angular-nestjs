import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProfileService, DEMO_PROFILES } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ProfileService, provideHttpClient()],
    });
    service = TestBed.inject(ProfileService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default profiles', () => {
    expect(service.profiles().length).toBeGreaterThanOrEqual(1);
    expect(service.hasSelectedProfile()).toBeTrue();
  });

  it('should compute kids mode accurately based on active profile', () => {
    service.setCurrentProfile(DEMO_PROFILES[0]); // adult profile
    expect(service.isKidsMode()).toBeFalse();

    service.setCurrentProfile(DEMO_PROFILES[1]); // kids club profile
    expect(service.isKidsMode()).toBeTrue();
  });

  it('should switch active profile and persist selection', () => {
    service.setCurrentProfile(DEMO_PROFILES[2]);
    expect(service.currentProfile()?.name).toBe('Family Lounge');
  });
});
