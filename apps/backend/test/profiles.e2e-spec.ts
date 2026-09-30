import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { DatabaseService } from '../src/modules/database/database.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { StorageService } from '../src/modules/storage/storage.service';
import { ProfilesService } from '../src/modules/profiles/profiles.service';
import { UserRole, UserProfileDto } from '@netflix/shared-types';

describe('ProfilesController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const testProfileId = '550e8400-e29b-41d4-a716-446655440000';
  const dummyProfile: UserProfileDto = {
    id: testProfileId,
    userId: 'user-uuid',
    name: 'Primary Profile',
    avatarUrl: 'https://assets.streamflix.local/avatars/netflix-avatar-red.png',
    isKids: false,
    maturityRating: '18+',
    language: 'en',
    hasPin: false,
    autoplayNext: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockProfilesService = {
    getProfilesByUserId: jest.fn().mockResolvedValue([dummyProfile]),
    getProfileById: jest.fn().mockResolvedValue(dummyProfile),
    createProfile: jest.fn().mockResolvedValue({
      ...dummyProfile,
      name: 'Kids Profile',
      isKids: true,
      maturityRating: '7+',
    }),
    updateProfile: jest.fn().mockResolvedValue({
      ...dummyProfile,
      name: 'Updated Profile',
    }),
    deleteProfile: jest.fn().mockResolvedValue(undefined),
    verifyPin: jest.fn().mockResolvedValue(true),
    selectProfile: jest.fn().mockResolvedValue({
      profile: dummyProfile,
      selectedAt: new Date().toISOString(),
    }),
    getAvailableAvatars: jest.fn().mockReturnValue([
      'https://assets.streamflix.local/avatars/netflix-avatar-red.png',
      'https://assets.streamflix.local/avatars/netflix-avatar-kids.png',
    ]),
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
      .overrideProvider(ProfilesService)
      .useValue(mockProfilesService)
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

  describe('Authentication protection', () => {
    it('should reject unauthenticated profile requests with 401', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profiles')
        .expect(401);
    });
  });

  describe('Profile Endpoints (Authenticated)', () => {
    let token: string;

    beforeAll(() => {
      token = jwtService.sign({
        sub: 'user-uuid',
        email: 'user@streamflix.local',
        role: UserRole.USER,
      });
    });

    it('GET /api/v1/profiles should return profiles list', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profiles')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data[0].id).toBe(testProfileId);
        });
    });

    it('GET /api/v1/profiles/avatars should return avatar presets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profiles/avatars')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveLength(2);
        });
    });

    it('GET /api/v1/profiles/:id should return single profile', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/profiles/${testProfileId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Primary Profile');
        });
    });

    it('POST /api/v1/profiles should validate inputs and create profile', () => {
      return request(app.getHttpServer())
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Kids Profile', isKids: true, maturityRating: '7+' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.isKids).toBe(true);
        });
    });

    it('PUT /api/v1/profiles/:id should update profile', () => {
      return request(app.getHttpServer())
        .put(`/api/v1/profiles/${testProfileId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Profile' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.name).toBe('Updated Profile');
        });
    });

    it('POST /api/v1/profiles/:id/verify-pin should verify PIN', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/profiles/${testProfileId}/verify-pin`)
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '1234' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.verified).toBe(true);
        });
    });

    it('POST /api/v1/profiles/:id/select should select profile', () => {
      return request(app.getHttpServer())
        .post(`/api/v1/profiles/${testProfileId}/select`)
        .set('Authorization', `Bearer ${token}`)
        .send({ pin: '1234' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.profile.id).toBe(testProfileId);
        });
    });

    it('DELETE /api/v1/profiles/:id should delete profile', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/profiles/${testProfileId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.deleted).toBe(true);
        });
    });
  });
});
