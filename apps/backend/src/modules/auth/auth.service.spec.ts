import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, Profile, RefreshToken } from '../../database/entities';
import { UserRole } from '@netflix/shared-types';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockProfileRepo: {
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockTokenRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockJwtService: {
    signAsync: jest.Mock;
  };

  beforeEach(async () => {
    mockUserRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => ({ id: 'user-uuid', ...data })),
      save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'user-uuid', ...data })),
    };

    mockProfileRepo = {
      create: jest.fn().mockImplementation((data) => ({ id: 'profile-uuid', ...data })),
      save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'profile-uuid', ...data })),
    };

    mockTokenRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => ({ id: 'token-uuid', ...data })),
      save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'token-uuid', ...data })),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('mocked-jwt-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepo },
        { provide: getRepositoryToken(RefreshToken), useValue: mockTokenRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.register({
        email: 'test@streamflix.local',
        password: 'Password123!',
        profileName: 'Tester',
      });

      expect(result.tokens.accessToken).toBe('mocked-jwt-access-token');
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@streamflix.local');
      expect(result.user.role).toBe(UserRole.USER);
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockProfileRepo.create).toHaveBeenCalled();
      expect(mockTokenRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email is already taken', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce({ id: 'existing-id', email: 'taken@streamflix.local' });

      await expect(
        service.register({
          email: 'taken@streamflix.local',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should authenticate user and return token pair on valid credentials', async () => {
      const passwordHash = await service.hashPassword('Password123!');
      const mockUser = {
        id: 'user-uuid',
        email: 'test@streamflix.local',
        passwordHash,
        role: UserRole.USER,
        isActive: true,
        isEmailVerified: true,
      };

      mockUserRepo.findOne.mockResolvedValueOnce(mockUser);

      const result = await service.login({
        email: 'test@streamflix.local',
        password: 'Password123!',
      });

      expect(result.tokens.accessToken).toBe('mocked-jwt-access-token');
      expect(result.user.id).toBe('user-uuid');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.login({
          email: 'nonexistent@streamflix.local',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on invalid password', async () => {
      const passwordHash = await service.hashPassword('CorrectPassword123!');
      mockUserRepo.findOne.mockResolvedValueOnce({
        id: 'user-uuid',
        email: 'test@streamflix.local',
        passwordHash,
        isActive: true,
      });

      await expect(
        service.login({
          email: 'test@streamflix.local',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    it('should rotate tokens and revoke old refresh token', async () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);

      const oldTokenRecord = {
        id: 'old-token-id',
        tokenHash: service.hashToken('valid-refresh-token'),
        isRevoked: false,
        expiresAt,
        user: {
          id: 'user-uuid',
          email: 'user@streamflix.local',
          role: UserRole.USER,
          isActive: true,
        },
      };

      mockTokenRepo.findOne.mockResolvedValueOnce(oldTokenRecord);

      const result = await service.refreshTokens({
        refreshToken: 'valid-refresh-token',
      });

      expect(oldTokenRecord.isRevoked).toBe(true);
      expect(result.accessToken).toBe('mocked-jwt-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(mockTokenRepo.save).toHaveBeenCalledWith(oldTokenRecord);
    });

    it('should throw UnauthorizedException if token is revoked or not found', async () => {
      mockTokenRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.refreshTokens({
          refreshToken: 'bad-token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke the refresh token in database', async () => {
      const tokenRecord = {
        id: 'token-id',
        isRevoked: false,
      };
      mockTokenRepo.findOne.mockResolvedValueOnce(tokenRecord);

      await service.logout('some-refresh-token');
      expect(tokenRecord.isRevoked).toBe(true);
      expect(mockTokenRepo.save).toHaveBeenCalledWith(tokenRecord);
    });
  });
});
