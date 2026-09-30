import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { DatabaseService } from '../src/modules/database/database.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { StorageService } from '../src/modules/storage/storage.service';
import { WatchlistService } from '../src/modules/watchlist/watchlist.service';
import { WatchlistItemDto, WatchlistResponseDto } from '@netflix/shared-types';

describe('Watchlist (e2e)', () => {
  let app: INestApplication;

  const validProfileId = '550e8400-e29b-41d4-a716-446655440000';
  const validContentId = '550e8400-e29b-41d4-a716-446655440001';

  const mockWatchlistItem: WatchlistItemDto = {
    id: '550e8400-e29b-41d4-a716-446655440099',
    profileId: validProfileId,
    movieId: validContentId,
    createdAt: new Date().toISOString(),
  };

  const mockWatchlistResponse: WatchlistResponseDto = {
    items: [mockWatchlistItem],
    total: 1,
  };

  const mockWatchlistService = {
    getWatchlist: jest.fn().mockResolvedValue(mockWatchlistResponse),
    addToWatchlist: jest.fn().mockResolvedValue(mockWatchlistItem),
    removeFromWatchlist: jest.fn().mockResolvedValue({ success: true, message: 'Removed' }),
    checkInWatchlist: jest.fn().mockResolvedValue({ inWatchlist: true, watchlistItemId: mockWatchlistItem.id }),
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
      .overrideProvider(WatchlistService)
      .useValue(mockWatchlistService)
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

  describe('GET /api/v1/watchlist', () => {
    it('should return 400 when profileId is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/watchlist')
        .expect(400);
    });

    it('should return watchlist items for a valid profileId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/watchlist?profileId=${validProfileId}`)
        .expect(200);

      expect(response.body.items).toBeDefined();
      expect(response.body.items.length).toBe(1);
      expect(response.body.total).toBe(1);
    });
  });

  describe('POST /api/v1/watchlist', () => {
    it('should add a title to watchlist', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/watchlist')
        .send({
          profileId: validProfileId,
          contentId: validContentId,
          contentType: 'movie',
        })
        .expect(201);

      expect(response.body.profileId).toBe(validProfileId);
      expect(response.body.movieId).toBe(validContentId);
    });
  });

  describe('DELETE /api/v1/watchlist/:profileId/:contentId', () => {
    it('should remove a title from watchlist', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/watchlist/${validProfileId}/${validContentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/watchlist/check', () => {
    it('should check if title is in watchlist', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/watchlist/check?profileId=${validProfileId}&contentId=${validContentId}`)
        .expect(200);

      expect(response.body.inWatchlist).toBe(true);
    });
  });
});
