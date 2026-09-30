import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { DatabaseService } from '../src/modules/database/database.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { StorageService } from '../src/modules/storage/storage.service';
import { SearchService } from '../src/modules/search/search.service';
import { SearchResultsResponseDto } from '@netflix/shared-types';

describe('Search (e2e)', () => {
  let app: INestApplication;

  const mockSearchResults: SearchResultsResponseDto = {
    query: 'matrix',
    items: [
      {
        id: 'm-1',
        title: 'Matrix Awakening',
        slug: 'matrix-awakening',
        description: 'A hacker discovers the simulated reality.',
        type: 'movie',
        posterUrl: 'https://example.com/poster.jpg',
        backdropUrl: 'https://example.com/backdrop.jpg',
        releaseDate: '2025-01-01T00:00:00.000Z',
        ageRating: '16+',
        durationMinutes: 136,
        averageRating: 4.9,
        genres: [{ id: 'g-1', name: 'Sci-Fi', slug: 'sci-fi' }],
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  };

  const mockSearchService = {
    search: jest.fn().mockImplementation((query) => {
      return Promise.resolve({
        ...mockSearchResults,
        query: query.q,
      });
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue({
        isInitialized: true,
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        destroy: jest.fn().mockResolvedValue(undefined),
        entityMetadatas: [],
        options: { type: 'postgres' },
        getRepository: jest.fn().mockReturnValue({
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockImplementation((d) => d),
          save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
        }),
      })
      .overrideProvider(DatabaseService)
      .useValue({ checkHealth: jest.fn().mockResolvedValue({ status: 'up' }) })
      .overrideProvider(RedisService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({ status: 'up' }),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
        del: jest.fn().mockResolvedValue(1),
      })
      .overrideProvider(StorageService)
      .useValue({ checkHealth: jest.fn().mockResolvedValue({ status: 'up' }) })
      .overrideProvider(SearchService)
      .useValue(mockSearchService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/search', () => {
    it('should return 400 when query parameter q is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/search')
        .expect(400);
    });

    it('should return search results for a valid search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search?q=matrix')
        .expect(200);

      expect(response.body.query).toBe('matrix');
      expect(response.body.items).toBeDefined();
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].title).toBe('Matrix Awakening');
      expect(response.body.total).toBe(1);
    });

    it('should support entity filtering and sorting query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search?q=matrix&type=movie&genre=sci-fi&sortBy=rating&page=1&limit=10')
        .expect(200);

      expect(mockSearchService.search).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'matrix',
          type: 'movie',
          genre: 'sci-fi',
          sortBy: 'rating',
          page: 1,
          limit: 10,
        }),
      );
      expect(response.body.items.length).toBe(1);
    });
  });
});
