import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@netflix/shared-types';

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: {
    register: jest.Mock;
    login: jest.Mock;
    refreshTokens: jest.Mock;
    logout: jest.Mock;
    getCurrentUser: jest.Mock;
  };

  const createMockRequest = (): Request =>
    ({
      ip: '127.0.0.1',
      headers: { 'user-agent': 'Jest' },
      socket: { remoteAddress: '127.0.0.1' },
    }) as unknown as Request;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn().mockResolvedValue({
        tokens: { accessToken: 'access-123', refreshToken: 'ref-123', expiresIn: 900 },
        user: { id: 'u-1', email: 'test@streamflix.local', role: UserRole.USER, isEmailVerified: false },
      }),
      login: jest.fn().mockResolvedValue({
        tokens: { accessToken: 'access-123', refreshToken: 'ref-123', expiresIn: 900 },
        user: { id: 'u-1', email: 'test@streamflix.local', role: UserRole.USER, isEmailVerified: false },
      }),
      refreshTokens: jest.fn().mockResolvedValue({
        accessToken: 'new-access-123',
        refreshToken: 'new-ref-123',
        expiresIn: 900,
      }),
      logout: jest.fn().mockResolvedValue(undefined),
      getCurrentUser: jest.fn().mockResolvedValue({
        id: 'u-1',
        email: 'test@streamflix.local',
        role: UserRole.USER,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user and return standard API envelope', async () => {
    const response = await controller.register(
      { email: 'test@streamflix.local', password: 'Password123!' },
      createMockRequest(),
    );
    expect(response.success).toBe(true);
    expect(response.data?.tokens.accessToken).toBe('access-123');
    expect(response.message).toBe('User registered successfully');
  });

  it('should login user and return standard API envelope', async () => {
    const response = await controller.login(
      { email: 'test@streamflix.local', password: 'Password123!' },
      createMockRequest(),
    );
    expect(response.success).toBe(true);
    expect(response.data?.user.email).toBe('test@streamflix.local');
  });

  it('should refresh tokens', async () => {
    const response = await controller.refresh(
      { refreshToken: 'ref-123' },
      createMockRequest(),
    );
    expect(response.success).toBe(true);
    expect(response.data?.accessToken).toBe('new-access-123');
  });

  it('should logout user and revoke token', async () => {
    const response = await controller.logout({ refreshToken: 'ref-123' });
    expect(response.success).toBe(true);
    expect(response.data?.revoked).toBe(true);
  });

  it('should get current authenticated user', async () => {
    const response = await controller.me({ sub: 'u-1', email: 'test@streamflix.local', role: UserRole.USER });
    expect(response.success).toBe(true);
    expect((response.data as { id: string }).id).toBe('u-1');
  });

  it('should verify admin check', () => {
    const response = controller.adminCheck({ sub: 'admin-1', email: 'admin@streamflix.local', role: UserRole.ADMIN });
    expect(response.success).toBe(true);
    expect(response.data?.authorized).toBe(true);
    expect(response.data?.role).toBe(UserRole.ADMIN);
  });

  it('should verify manager check', () => {
    const response = controller.managerCheck({ sub: 'mgr-1', email: 'mgr@streamflix.local', role: UserRole.CONTENT_MANAGER });
    expect(response.success).toBe(true);
    expect(response.data?.authorized).toBe(true);
    expect(response.data?.role).toBe(UserRole.CONTENT_MANAGER);
  });

  it('should verify permission check', () => {
    const response = controller.permissionCheck({ sub: 'mgr-1', email: 'mgr@streamflix.local', role: UserRole.CONTENT_MANAGER });
    expect(response.success).toBe(true);
    expect(response.data?.authorized).toBe(true);
  });
});
