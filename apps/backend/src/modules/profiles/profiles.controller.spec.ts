import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { UserRole } from '@netflix/shared-types';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let mockProfilesService: {
    getProfilesByUserId: jest.Mock;
    getProfileById: jest.Mock;
    createProfile: jest.Mock;
    updateProfile: jest.Mock;
    deleteProfile: jest.Mock;
    verifyPin: jest.Mock;
    selectProfile: jest.Mock;
    getAvailableAvatars: jest.Mock;
  };

  const mockUser = {
    sub: 'user-uuid',
    email: 'user@streamflix.local',
    role: UserRole.USER,
  };

  const dummyProfileDto = {
    id: 'prof-uuid',
    userId: 'user-uuid',
    name: 'Main Profile',
    avatarUrl: 'https://assets.streamflix.local/avatars/netflix-avatar-red.png',
    isKids: false,
    maturityRating: '18+' as const,
    language: 'en',
    hasPin: false,
    autoplayNext: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    mockProfilesService = {
      getProfilesByUserId: jest.fn().mockResolvedValue([dummyProfileDto]),
      getProfileById: jest.fn().mockResolvedValue(dummyProfileDto),
      createProfile: jest.fn().mockResolvedValue(dummyProfileDto),
      updateProfile: jest.fn().mockResolvedValue({ ...dummyProfileDto, name: 'Renamed' }),
      deleteProfile: jest.fn().mockResolvedValue(undefined),
      verifyPin: jest.fn().mockResolvedValue(true),
      selectProfile: jest.fn().mockResolvedValue({
        profile: dummyProfileDto,
        selectedAt: new Date().toISOString(),
      }),
      getAvailableAvatars: jest.fn().mockReturnValue(['https://assets.streamflix.local/avatars/red.png']),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all profiles for current user', async () => {
    const res = await controller.getProfiles(mockUser);
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(mockProfilesService.getProfilesByUserId).toHaveBeenCalledWith('user-uuid');
  });

  it('should get available avatar presets', () => {
    const res = controller.getAvatars();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
  });

  it('should get profile by ID', async () => {
    const res = await controller.getProfile('prof-uuid', mockUser);
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('prof-uuid');
  });

  it('should create new profile', async () => {
    const res = await controller.createProfile({ name: 'Kids Profile', isKids: true }, mockUser);
    expect(res.success).toBe(true);
    expect(mockProfilesService.createProfile).toHaveBeenCalledWith('user-uuid', {
      name: 'Kids Profile',
      isKids: true,
    });
  });

  it('should update profile', async () => {
    const res = await controller.updateProfile('prof-uuid', { name: 'Renamed' }, mockUser);
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe('Renamed');
  });

  it('should delete profile', async () => {
    const res = await controller.deleteProfile('prof-uuid', mockUser);
    expect(res.success).toBe(true);
    expect(res.data?.deleted).toBe(true);
  });

  it('should verify profile PIN', async () => {
    const res = await controller.verifyPin('prof-uuid', { pin: '1234' }, mockUser);
    expect(res.success).toBe(true);
    expect(res.data?.verified).toBe(true);
  });

  it('should select active profile', async () => {
    const res = await controller.selectProfile('prof-uuid', { pin: '1234' }, mockUser);
    expect(res.success).toBe(true);
    expect(res.data?.profile.id).toBe('prof-uuid');
  });
});
