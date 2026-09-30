import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { AuthService } from '../src/modules/auth/auth.service';
import { DatabaseService } from '../src/modules/database/database.service';
import { RedisService } from '../src/modules/redis/redis.service';
import { StorageService } from '../src/modules/storage/storage.service';
import { UserRole } from '@netflix/shared-types';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
    refreshTokens: jest.Mock;
    logout: jest.Mock;
    getCurrentUser: jest.Mock;
  };

  beforeAll(async () => {
    mockAuthService = {
      register: jest.fn().mockResolvedValue({
        tokens: {
          accessToken: 'e2e-access-token',
          refreshToken: 'e2e-refresh-token',
          expiresIn: 900,
        },
        user: {
          id: 'e2e-user-id',
          email: 'newuser@streamflix.local',
          role: UserRole.USER,
          isEmailVerified: false,
        },
      }),
      login: jest.fn().mockResolvedValue({
        tokens: {
          accessToken: 'e2e-access-token',
          refreshToken: 'e2e-refresh-token',
          expiresIn: 900,
        },
        user: {
          id: 'e2e-user-id',
          email: 'existing@streamflix.local',
          role: UserRole.USER,
          isEmailVerified: true,
        },
      }),
      refreshTokens: jest.fn().mockResolvedValue({
        accessToken: 'new-e2e-access-token',
        refreshToken: 'new-e2e-refresh-token',
        expiresIn: 900,
      }),
      logout: jest.fn().mockResolvedValue(undefined),
      getCurrentUser: jest.fn().mockResolvedValue({
        id: 'e2e-user-id',
        email: 'user@streamflix.local',
        role: UserRole.USER,
      }),
    };

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
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({ status: 'up' }),
      })
      .overrideProvider(RedisService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({ status: 'up' }),
      })
      .overrideProvider(StorageService)
      .useValue({
        checkHealth: jest.fn().mockResolvedValue({ status: 'up' }),
      })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
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

  describe('/api/v1/auth/register (POST)', () => {
    it('should validate inputs and reject short passwords', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'bad@streamflix.local', password: 'short' })
        .expect(400);
    });

    it('should validate email format and reject invalid emails', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'ValidPassword123!' })
        .expect(400);
    });

    it('should register successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'newuser@streamflix.local', password: 'ValidPassword123!', profileName: 'Alex' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.tokens.accessToken).toBe('e2e-access-token');
          expect(res.body.data.user.email).toBe('newuser@streamflix.local');
        });
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should reject login without password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'user@streamflix.local' })
        .expect(400);
    });

    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'existing@streamflix.local', password: 'ValidPassword123!' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.tokens.accessToken).toBe('e2e-access-token');
        });
    });
  });

  describe('/api/v1/auth/refresh (POST)', () => {
    it('should rotate tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.accessToken).toBe('new-e2e-access-token');
        });
    });
  });

  describe('/api/v1/auth/logout (POST)', () => {
    it('should revoke active session token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken: 'active-refresh-token' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.revoked).toBe(true);
        });
    });
  });

  describe('Authorization & RBAC (e2e)', () => {
    let userToken: string;
    let adminToken: string;
    let managerToken: string;

    beforeAll(() => {
      userToken = jwtService.sign({
        sub: 'user-uuid',
        email: 'user@streamflix.local',
        role: UserRole.USER,
      });
      adminToken = jwtService.sign({
        sub: 'admin-uuid',
        email: 'admin@streamflix.local',
        role: UserRole.ADMIN,
      });
      managerToken = jwtService.sign({
        sub: 'mgr-uuid',
        email: 'manager@streamflix.local',
        role: UserRole.CONTENT_MANAGER,
      });
    });

    describe('/api/v1/auth/me (GET)', () => {
      it('should reject unauthenticated request with 401', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .expect(401);
      });

      it('should return authenticated user profile with valid Bearer token', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe('e2e-user-id');
          });
      });
    });

    describe('/api/v1/auth/admin-check (GET)', () => {
      it('should return 401 when token is missing', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/admin-check')
          .expect(401);
      });

      it('should return 403 Forbidden when accessed by standard USER role', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/admin-check')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return 200 OK when accessed by ADMIN role', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/admin-check')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.authorized).toBe(true);
            expect(res.body.data.role).toBe(UserRole.ADMIN);
          });
      });
    });

    describe('/api/v1/auth/manager-check (GET)', () => {
      it('should return 403 Forbidden for USER role', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/manager-check')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return 200 OK for CONTENT_MANAGER role', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/manager-check')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.authorized).toBe(true);
            expect(res.body.data.role).toBe(UserRole.CONTENT_MANAGER);
          });
      });

      it('should return 200 OK for ADMIN role', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/manager-check')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.authorized).toBe(true);
          });
      });
    });

    describe('/api/v1/auth/permission-check (GET)', () => {
      it('should return 403 Forbidden for USER role lacking permissions', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/permission-check')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return 200 OK for CONTENT_MANAGER with media upload & content create', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/permission-check')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.authorized).toBe(true);
          });
      });
    });
  });
});
