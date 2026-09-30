import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { DatabaseService } from '../src/modules/database/database.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { StorageService } from '../src/modules/storage/storage.service';
import { MoviesService } from '../src/modules/content/services/movies.service';
import { SeriesService } from '../src/modules/content/services/series.service';
import { GenresService } from '../src/modules/content/services/genres.service';
import { CategoriesService } from '../src/modules/content/services/categories.service';
import { UserRole, ContentStatus, MovieDto, SeriesDto, GenreDto, CategoryDto } from '@netflix/shared-types';

describe('ContentCatalog (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const dummyGenre: GenreDto = { id: 'g-1', name: 'Sci-Fi', slug: 'sci-fi' };
  const dummyCategory: CategoryDto = {
    id: 'c-1',
    name: 'Trending Now',
    slug: 'trending-now',
    displayOrder: 1,
    isActive: true,
  };
  const dummyMovie: MovieDto = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Interstellar',
    slug: 'interstellar-2014',
    description: 'A team of explorers...',
    releaseDate: '2014-11-07',
    durationMinutes: 169,
    ageRating: '13+',
    language: 'English',
    country: 'USA',
    posterUrl: 'poster.jpg',
    backdropUrl: 'backdrop.jpg',
    status: ContentStatus.PUBLISHED,
    viewCount: 15400,
    averageRating: 4.8,
    genres: [dummyGenre],
  };

  const dummySeries: SeriesDto = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Stranger Things',
    slug: 'stranger-things',
    description: 'Hawkins Indiana...',
    releaseDate: '2016-07-15',
    ageRating: '16+',
    language: 'English',
    posterUrl: 'poster.jpg',
    backdropUrl: 'backdrop.jpg',
    status: ContentStatus.PUBLISHED,
    genres: [dummyGenre],
    seasons: [],
  };

  const mockMoviesService = {
    findAll: jest.fn().mockResolvedValue([dummyMovie]),
    findBySlugOrId: jest.fn().mockResolvedValue(dummyMovie),
    create: jest.fn().mockResolvedValue(dummyMovie),
    update: jest.fn().mockResolvedValue(dummyMovie),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const mockSeriesService = {
    findAll: jest.fn().mockResolvedValue([dummySeries]),
    findBySlugOrId: jest.fn().mockResolvedValue(dummySeries),
    create: jest.fn().mockResolvedValue(dummySeries),
    update: jest.fn().mockResolvedValue(dummySeries),
    delete: jest.fn().mockResolvedValue(undefined),
    addSeason: jest.fn().mockResolvedValue({ id: 's-1', seasonNumber: 1, title: 'Season 1', episodes: [] }),
    addEpisode: jest.fn().mockResolvedValue({ id: 'e-1', episodeNumber: 1, title: 'Ep 1', durationMinutes: 45, thumbnailUrl: 't.jpg' }),
    getSeasons: jest.fn().mockResolvedValue([]),
    getEpisodes: jest.fn().mockResolvedValue([]),
  };

  const mockGenresService = {
    findAll: jest.fn().mockResolvedValue([dummyGenre]),
    findBySlug: jest.fn().mockResolvedValue(dummyGenre),
    create: jest.fn().mockResolvedValue(dummyGenre),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const mockCategoriesService = {
    findAll: jest.fn().mockResolvedValue([dummyCategory]),
    getHomeFeed: jest.fn().mockResolvedValue([
      {
        category: dummyCategory,
        movies: [dummyMovie],
        series: [dummySeries],
      },
    ]),
    create: jest.fn().mockResolvedValue(dummyCategory),
    delete: jest.fn().mockResolvedValue(undefined),
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
      .useValue({ checkHealth: jest.fn().mockResolvedValue({ status: 'up' }) })
      .overrideProvider(StorageService)
      .useValue({ checkHealth: jest.fn().mockResolvedValue({ status: 'up' }) })
      .overrideProvider(MoviesService)
      .useValue(mockMoviesService)
      .overrideProvider(SeriesService)
      .useValue(mockSeriesService)
      .overrideProvider(GenresService)
      .useValue(mockGenresService)
      .overrideProvider(CategoriesService)
      .useValue(mockCategoriesService)
      .compile();

    jwtService = moduleFixture.get<JwtService>(JwtService);
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
    if (app) {
      await app.close();
    }
  });

  describe('Movies Endpoints (e2e)', () => {
    let adminToken: string;
    let userToken: string;

    beforeAll(() => {
      adminToken = jwtService.sign({
        sub: 'admin-uuid',
        email: 'admin@streamflix.local',
        role: UserRole.ADMIN,
      });
      userToken = jwtService.sign({
        sub: 'user-uuid',
        email: 'user@streamflix.local',
        role: UserRole.USER,
      });
    });

    it('GET /api/v1/movies should return movie catalog without auth', () => {
      return request(app.getHttpServer())
        .get('/api/v1/movies')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data[0].title).toBe('Interstellar');
        });
    });

    it('GET /api/v1/movies/:identifier should return single movie', () => {
      return request(app.getHttpServer())
        .get('/api/v1/movies/interstellar-2014')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.slug).toBe('interstellar-2014');
        });
    });

    it('POST /api/v1/movies should reject unauthenticated request with 401', () => {
      return request(app.getHttpServer())
        .post('/api/v1/movies')
        .send({ title: 'New Movie' })
        .expect(401);
    });

    it('POST /api/v1/movies should reject standard user with 403 Forbidden', () => {
      return request(app.getHttpServer())
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Movie',
          description: 'Plot',
          releaseDate: '2026-01-01',
          durationMinutes: 120,
          posterUrl: 'poster.jpg',
          backdropUrl: 'backdrop.jpg',
        })
        .expect(403);
    });

    it('POST /api/v1/movies should allow admin with 201 Created', () => {
      return request(app.getHttpServer())
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Authorized Movie',
          description: 'Plot',
          releaseDate: '2026-01-01',
          durationMinutes: 120,
          posterUrl: 'poster.jpg',
          backdropUrl: 'backdrop.jpg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('Interstellar');
        });
    });
  });

  describe('Series Endpoints (e2e)', () => {
    it('GET /api/v1/series should return series list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/series')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data[0].title).toBe('Stranger Things');
        });
    });

    it('GET /api/v1/series/:identifier should return single series', () => {
      return request(app.getHttpServer())
        .get('/api/v1/series/stranger-things')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.slug).toBe('stranger-things');
        });
    });
  });

  describe('Genres and Categories Endpoints (e2e)', () => {
    it('GET /api/v1/genres should return all genres', () => {
      return request(app.getHttpServer())
        .get('/api/v1/genres')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data[0].slug).toBe('sci-fi');
        });
    });

    it('GET /api/v1/categories should return all categories', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categories')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data[0].slug).toBe('trending-now');
        });
    });

    it('GET /api/v1/categories/feed should return homepage category rows', () => {
      return request(app.getHttpServer())
        .get('/api/v1/categories/feed')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data[0].category.slug).toBe('trending-now');
          expect(res.body.data[0].movies).toHaveLength(1);
          expect(res.body.data[0].series).toHaveLength(1);
        });
    });
  });
});
