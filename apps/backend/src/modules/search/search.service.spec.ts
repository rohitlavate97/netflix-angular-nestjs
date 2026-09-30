import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SearchService } from './search.service';
import { Movie } from '../../database/entities/movie.entity';
import { Series } from '../../database/entities/series.entity';
import { RedisService } from '../redis/redis.service';
import { SearchEntityType, SearchSortBy, ContentStatus } from '@netflix/shared-types';

describe('SearchService', () => {
  let service: SearchService;
  let mockMovieRepo: {
    createQueryBuilder: jest.Mock;
  };
  let mockSeriesRepo: {
    createQueryBuilder: jest.Mock;
  };
  let mockRedisService: {
    get: jest.Mock;
    set: jest.Mock;
  };

  const dummyMovie = (overrides = {}): Movie =>
    ({
      id: 'm-1',
      title: 'Matrix Awakening',
      slug: 'matrix-awakening',
      description: 'A hacker discovers the simulated reality.',
      releaseDate: new Date('2025-01-01'),
      durationMinutes: 136,
      ageRating: '16+',
      posterUrl: 'https://example.com/matrix.jpg',
      backdropUrl: 'https://example.com/matrix-bg.jpg',
      status: ContentStatus.PUBLISHED,
      averageRating: 4.9,
      genres: [{ id: 'g1', name: 'Sci-Fi', slug: 'sci-fi' }],
      ...overrides,
    }) as unknown as Movie;

  const dummySeries = (overrides = {}): Series =>
    ({
      id: 's-1',
      title: 'Cyberpunk Chronicles',
      slug: 'cyberpunk-chronicles',
      description: 'Living in the digital underbelly of Neo Tokyo.',
      releaseDate: new Date('2024-06-15'),
      ageRating: '18+',
      posterUrl: 'https://example.com/cyber.jpg',
      backdropUrl: 'https://example.com/cyber-bg.jpg',
      status: ContentStatus.PUBLISHED,
      genres: [{ id: 'g1', name: 'Sci-Fi', slug: 'sci-fi' }],
      seasons: [{ id: 'season-1' }],
      ...overrides,
    }) as unknown as Series;

  beforeEach(async () => {
    const movieQbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([dummyMovie()]),
    };

    const seriesQbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([dummySeries()]),
    };

    mockMovieRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(movieQbMock),
    };

    mockSeriesRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(seriesQbMock),
    };

    mockRedisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: getRepositoryToken(Movie), useValue: mockMovieRepo },
        { provide: getRepositoryToken(Series), useValue: mockSeriesRepo },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty result when query string is empty', async () => {
    const res = await service.search({ q: '   ' });
    expect(res.items).toEqual([]);
    expect(res.total).toBe(0);
    expect(mockRedisService.get).not.toHaveBeenCalled();
  });

  it('should return cached result if found in Redis', async () => {
    const cachedResponse = {
      query: 'matrix',
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
    mockRedisService.get.mockResolvedValueOnce(cachedResponse);

    const res = await service.search({ q: 'matrix' });
    expect(res).toEqual(cachedResponse);
    expect(mockMovieRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('should search across movies and series when type is ALL', async () => {
    const res = await service.search({ q: 'cyber' });
    expect(res.items.length).toBe(2);
    expect(res.total).toBe(2);
    expect(mockMovieRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockSeriesRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockRedisService.set).toHaveBeenCalled();
  });

  it('should only query movies repository when type is MOVIE', async () => {
    const res = await service.search({ q: 'matrix', type: SearchEntityType.MOVIE });
    expect(mockMovieRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockSeriesRepo.createQueryBuilder).not.toHaveBeenCalled();
    expect(res.items.length).toBe(1);
    expect(res.items[0].type).toBe('movie');
  });

  it('should only query series repository when type is SERIES', async () => {
    const res = await service.search({ q: 'cyber', type: SearchEntityType.SERIES });
    expect(mockSeriesRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockMovieRepo.createQueryBuilder).not.toHaveBeenCalled();
    expect(res.items.length).toBe(1);
    expect(res.items[0].type).toBe('series');
  });

  it('should sort results by release date when sortBy is NEWEST', async () => {
    const res = await service.search({ q: 'sci-fi', sortBy: SearchSortBy.NEWEST });
    expect(res.items.length).toBe(2);
    const date0 = new Date(res.items[0].releaseDate).getTime();
    const date1 = new Date(res.items[1].releaseDate).getTime();
    expect(date0).toBeGreaterThanOrEqual(date1);
  });

  it('should sort results by rating when sortBy is RATING', async () => {
    const res = await service.search({ q: 'sci-fi', sortBy: SearchSortBy.RATING });
    expect(res.items.length).toBe(2);
    expect(res.items[0].averageRating).toBeGreaterThanOrEqual(res.items[1].averageRating ?? 0);
  });

  it('should sort results by title when sortBy is TITLE', async () => {
    const res = await service.search({ q: 'sci-fi', sortBy: SearchSortBy.TITLE });
    expect(res.items.length).toBe(2);
    expect(res.items[0].title.localeCompare(res.items[1].title)).toBeLessThanOrEqual(0);
  });
});
