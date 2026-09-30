import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { SearchComponent } from './search.component';
import { ContentService } from '../../core/services/content.service';
import {
  SearchResultItemDto,
  SearchResultsResponseDto,
  SearchEntityType,
} from '@netflix/shared-types';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let contentService: ContentService;
  let router: Router;
  let queryParamsSubject: BehaviorSubject<Record<string, string>>;

  const mockItem: SearchResultItemDto = {
    id: 'm-1',
    title: 'Matrix Awakening',
    slug: 'matrix-awakening',
    description: 'A cyber reality thriller.',
    type: 'movie',
    posterUrl: 'https://example.com/p.jpg',
    backdropUrl: 'https://example.com/b.jpg',
    releaseDate: '2025-01-01',
    ageRating: '16+',
    durationMinutes: 120,
    averageRating: 4.8,
    genres: [{ id: 'g1', name: 'Sci-Fi', slug: 'sci-fi' }],
  };

  const mockSearchResponse: SearchResultsResponseDto = {
    query: 'matrix',
    items: [mockItem],
    total: 1,
    page: 1,
    limit: 30,
    totalPages: 1,
  };

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject<Record<string, string>>({});

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        ContentService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    contentService = TestBed.inject(ContentService);
    router = TestBed.inject(Router);

    spyOn(contentService, 'search').and.returnValue(of(mockSearchResponse));
    spyOn(contentService, 'getMovies').and.returnValue(
      of({ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    );

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create search component', () => {
    expect(component).toBeTruthy();
  });

  it('should render initial discovery state when query is empty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Popular Searches');
    expect(compiled.textContent).toContain('Cyberpunk');
    expect(compiled.textContent).toContain('Space Odyssey');
  });

  it('should perform search when route query param q is present', () => {
    queryParamsSubject.next({ q: 'matrix' });
    fixture.detectChanges();

    expect(contentService.search).toHaveBeenCalled();
    expect(component.searchResults().length).toBe(1);
    expect(component.searchResults()[0].title).toBe('Matrix Awakening');
    expect(component.totalResults()).toBe(1);
  });

  it('should update query params and trigger debounced search on input', fakeAsync(() => {
    const navSpy = spyOn(router, 'navigate');
    component.onQueryInput('space');
    tick(400);

    expect(navSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ q: 'space' }),
      }),
    );
  }));

  it('should set entity filter type and update query params', () => {
    const navSpy = spyOn(router, 'navigate');
    component.setType('movie' as SearchEntityType);

    expect(component.selectedType()).toBe('movie' as SearchEntityType);
    expect(navSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ type: 'movie' }),
      }),
    );
  });

  it('should clear search and reset query text', () => {
    const navSpy = spyOn(router, 'navigate');
    component.queryText.set('matrix');
    component.clearSearch();

    expect(component.queryText()).toBe('');
    expect(navSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ q: null }),
      }),
    );
  });

  it('should select popular keyword and trigger search', () => {
    const navSpy = spyOn(router, 'navigate');
    component.selectKeyword('Cyberpunk');

    expect(component.queryText()).toBe('Cyberpunk');
    expect(navSpy).toHaveBeenCalledWith(
      [],
      jasmine.objectContaining({
        queryParams: jasmine.objectContaining({ q: 'Cyberpunk' }),
      }),
    );
  });

  it('should handle error state when search service fails', () => {
    (contentService.search as jasmine.Spy).and.returnValue(
      throwError(() => new Error('Search failed')),
    );

    component.queryText.set('cyber');
    component.executeSearch();
    fixture.detectChanges();

    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeTrue();
  });

  it('should navigate to watch player on onPlay', () => {
    const navSpy = spyOn(router, 'navigate');
    component.onPlay(mockItem);
    expect(navSpy).toHaveBeenCalledWith(['/watch', 'm-1']);
  });

  it('should navigate to details on onDetails', () => {
    const navSpy = spyOn(router, 'navigate');
    component.onDetails(mockItem);
    expect(navSpy).toHaveBeenCalledWith(['/title', 'm-1']);
  });
});
