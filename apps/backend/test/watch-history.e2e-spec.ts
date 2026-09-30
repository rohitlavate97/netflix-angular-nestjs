import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { DatabaseService } from '../src/modules/database/database.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { StorageService } from '../src/modules/storage/storage.service';
import { WatchHistoryService } from '../src/modules/watch-history/watch-history.service';

describe('WatchHistory (e2e)', () => {
  let app: INestApplication;

  const validProfileId = '550e8400-e29b-41d4-a716-446655440000';
  const validMovieId = '550e8400-e29b-41d4-a716-446655440001';
  const validHistoryId = '550e8400-e29b-41d4-a716-446655440002';

  const mockWatchHistoryService = {
    reportProgress: jest.fn().mockResolvedValue({
      id: validHistoryId,
      profileId: validProfileId,
      movieId: validMovieId,
      positionSeconds: 150,
      durationSeconds: 3600,
      progressPercentage: 4.17,
      completed: false,
    }),
    getContinueWatching: jest.fn().mockResolvedValue({
      items: [
        {
          id: validHistoryId,
          profileId: validProfileId,
          contentId: validMovieId,
          title: 'Cyberpunk Odyssey',
          posterUrl: 'poster.jpg',
          backdropUrl: 'backdrop.jpg',
          isSeries: false,
          movieId: validMovieId,
          positionSeconds: 150,
          durationSeconds: 3600,
          progressPercentage: 4.17,
          remainingMinutes: 58,
          completed: false,
          lastWatchedAt: new Date().toISOString(),
        },
      ],
      total: 1,
    }),
    getResumePlayback: jest.fn().mockResolvedValue({
      contentId: validMovieId,
      positionSeconds: 150,
      durationSeconds: 3600,
      progressPercentage: 4.17,
      completed: false,
    }),
    getWatchHistory: jest.fn().mockResolvedValue({
      items: [
        {
          id: validHistoryId,
          profileId: validProfileId,
          movieId: validMovieId,
          positionSeconds: 150,
          durationSeconds: 3600,
          progressPercentage: 4.17,
          completed: false,
          lastWatchedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    }),
    removeFromWatchHistory: jest.fn().mockResolvedValue({
      success: true,
      message: 'Item removed from watch history',
    }),
    clearWatchHistory: jest.fn().mockResolvedValue({
      success: true,
      message: 'Watch history cleared successfully',
      deletedCount: 1,
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
      .overrideProvider(WatchHistoryService)
      .useValue(mockWatchHistoryService)
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

  describe('POST /api/v1/watch-history/progress', () => {
    it('should return 400 when profileId is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/watch-history/progress')
        .send({ movieId: validMovieId, positionSeconds: 120, durationSeconds: 3600 })
        .expect(400);
    });

    it('should record playback progress for valid payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/watch-history/progress')
        .send({
          profileId: validProfileId,
          movieId: validMovieId,
          positionSeconds: 150,
          durationSeconds: 3600,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.positionSeconds).toBe(150);
    });
  });

  describe('GET /api/v1/watch-history/continue-watching', () => {
    it('should return 400 when profileId is missing', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/watch-history/continue-watching')
        .expect(400);
    });

    it('should return continue watching items for valid profileId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/watch-history/continue-watching?profileId=${validProfileId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.items[0].remainingMinutes).toBe(58);
    });
  });

  describe('GET /api/v1/watch-history/resume', () => {
    it('should return resume playback position', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/watch-history/resume?profileId=${validProfileId}&movieId=${validMovieId}`,
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.positionSeconds).toBe(150);
    });
  });

  describe('GET /api/v1/watch-history', () => {
    it('should return paginated watch history for valid profileId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/watch-history?profileId=${validProfileId}&page=1&limit=10`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.items.length).toBe(1);
      expect(response.body.data.total).toBe(1);
    });
  });

  describe('DELETE /api/v1/watch-history/:id', () => {
    it('should remove item from watch history', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/api/v1/watch-history/${validHistoryId}?profileId=${validProfileId}`,
        )
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Item removed from watch history');
    });
  });
});
