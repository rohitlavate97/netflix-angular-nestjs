import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ProfilesService } from './profiles.service';
import { Profile } from '../../database/entities/profile.entity';
import { MAX_PROFILES_PER_USER } from '@netflix/shared-types';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let mockProfileRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  const dummyProfile = (overrides = {}): Profile =>
    ({
      id: 'prof-1',
      userId: 'user-1',
      name: 'Primary Profile',
      avatarUrl: 'https://assets.streamflix.local/avatars/netflix-avatar-red.png',
      isKids: false,
      maturityRating: '18+',
      language: 'en',
      pin: undefined,
      autoplayNext: true,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      ...overrides,
    }) as unknown as Profile;

  beforeEach(async () => {
    mockProfileRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 'prof-generated', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'prof-generated', ...d })),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepo,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfilesByUserId', () => {
    it('should return list of user profile DTOs', async () => {
      mockProfileRepo.find.mockResolvedValueOnce([dummyProfile()]);
      const result = await service.getProfilesByUserId('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prof-1');
      expect(result[0].hasPin).toBe(false);
    });
  });

  describe('getProfileById', () => {
    it('should return profile if owned by user', async () => {
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile());
      const result = await service.getProfileById('user-1', 'prof-1');

      expect(result.id).toBe('prof-1');
    });

    it('should return profile if requester is admin', async () => {
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile({ userId: 'other-user' }));
      const result = await service.getProfileById('admin-user', 'prof-1', true);

      expect(result.id).toBe('prof-1');
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfileRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.getProfileById('user-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if profile belongs to another user', async () => {
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile({ userId: 'other-user' }));

      await expect(service.getProfileById('user-1', 'prof-1', false)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('createProfile', () => {
    it('should create new profile and hash PIN if provided', async () => {
      mockProfileRepo.count.mockResolvedValueOnce(1);
      mockProfileRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.createProfile('user-1', {
        name: 'Kids Profile',
        isKids: true,
        maturityRating: '18+', // Should clamp to 7+
        pin: '1234',
      });

      expect(result.name).toBe('Kids Profile');
      expect(result.isKids).toBe(true);
      expect(result.maturityRating).toBe('7+');
      expect(result.hasPin).toBe(true);
    });

    it('should throw BadRequestException if max profiles limit reached', async () => {
      mockProfileRepo.count.mockResolvedValueOnce(MAX_PROFILES_PER_USER);

      await expect(
        service.createProfile('user-1', { name: 'Too Many' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if profile name already exists on account', async () => {
      mockProfileRepo.count.mockResolvedValueOnce(2);
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile({ name: 'Duplicate' }));

      await expect(
        service.createProfile('user-1', { name: 'Duplicate' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields successfully', async () => {
      const existing = dummyProfile();
      mockProfileRepo.findOne.mockResolvedValueOnce(existing);

      const result = await service.updateProfile('user-1', 'prof-1', {
        name: 'Updated Name',
        language: 'es',
        autoplayNext: false,
      });

      expect(result.name).toBe('Updated Name');
      expect(result.language).toBe('es');
      expect(result.autoplayNext).toBe(false);
    });

    it('should remove PIN if null is passed', async () => {
      const hashedPin = await bcrypt.hash('1234', 10);
      const existing = dummyProfile({ pin: hashedPin });
      mockProfileRepo.findOne.mockResolvedValueOnce(existing);

      const result = await service.updateProfile('user-1', 'prof-1', {
        pin: null,
      });

      expect(result.hasPin).toBe(false);
    });
  });

  describe('deleteProfile', () => {
    it('should remove profile if more than 1 profile exists', async () => {
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile());
      mockProfileRepo.count.mockResolvedValueOnce(2);

      await expect(service.deleteProfile('user-1', 'prof-1')).resolves.toBeUndefined();
      expect(mockProfileRepo.remove).toHaveBeenCalled();
    });

    it('should throw BadRequestException if deleting the only profile', async () => {
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile());
      mockProfileRepo.count.mockResolvedValueOnce(1);

      await expect(service.deleteProfile('user-1', 'prof-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('verifyPin & selectProfile', () => {
    it('should verify correct PIN', async () => {
      const hashedPin = await bcrypt.hash('4321', 10);
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile({ pin: hashedPin }));

      const verified = await service.verifyPin('user-1', 'prof-1', '4321');
      expect(verified).toBe(true);
    });

    it('should throw UnauthorizedException on wrong PIN', async () => {
      const hashedPin = await bcrypt.hash('4321', 10);
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile({ pin: hashedPin }));

      await expect(service.verifyPin('user-1', 'prof-1', '0000')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should select unlocked profile without PIN', async () => {
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile({ pin: undefined }));

      const result = await service.selectProfile('user-1', 'prof-1');
      expect(result.profile.id).toBe('prof-1');
      expect(result.selectedAt).toBeDefined();
    });

    it('should throw UnauthorizedException if locked profile is selected without PIN', async () => {
      const hashedPin = await bcrypt.hash('9999', 10);
      mockProfileRepo.findOne.mockResolvedValueOnce(dummyProfile({ pin: hashedPin }));

      await expect(service.selectProfile('user-1', 'prof-1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
