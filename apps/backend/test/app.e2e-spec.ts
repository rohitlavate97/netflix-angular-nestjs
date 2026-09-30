import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/modules/database/database.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { StorageService } from '../src/modules/storage/storage.service';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue({
        isInitialized: true,
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        destroy: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(DatabaseService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({ status: 'up', latencyMs: 3 }),
      })
      .overrideProvider(RedisService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({ status: 'up', latencyMs: 1 }),
      })
      .overrideProvider(StorageService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({ status: 'up', latencyMs: 5, bucketsCount: 2 }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Netflix Clone Streaming API');
      });
  });

  it('/api/v1/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.database).toBe('up');
        expect(res.body.redis).toBe('up');
        expect(res.body.storage).toBe('up');
        expect(res.body.details).toBeDefined();
        expect(res.body.details.database.status).toBe('up');
        expect(res.body.details.redis.status).toBe('up');
        expect(res.body.details.storage.status).toBe('up');
      });
  });
});
