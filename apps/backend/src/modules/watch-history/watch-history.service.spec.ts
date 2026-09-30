import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistory } from '../../database/entities/watch-history.entity';
import { Profile } from '../../database/entities/profile.entity';
import { Movie } from '../../database/entities/movie.entity';
import { Episode } from '../../database/entities/episode.entity';
import { RedisService } from '../redis/redis.service';

describe('WatchHistoryService', () => {
  let service: WatchHistoryService;
  let mockWatchHistoryRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let mockProfileRepo: {
    findOne: jest.Mock;
  };
  let mockMovieRepo: {
    findOne: jest.Mock;
  };
  let mockEpisodeRepo: {
    findOne: jest.Mock;
  };
  let mockRedisService: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  const dummyProfile = { id: 'prof-1', name: 'Rohit' } as Profile;
  const dummyMovie = {
    id: 'm-1',
    title: 'Shadow Protocol',
    slug: 'shadow-protocol',
    description: 'Cyber thriller',
    releaseDate: new Date('2025-01-01'),
    durationMinutes: 120,
    ageRating: '16+',
    language: 'English',
    country: 'USA',
    posterUrl: 'poster.jpg',
    backdropUrl: 'backdrop.jpg',
    status: 'published',
    viewCount: 1000,
    averageRating: 4.8,
    genres: [{ id: 'g-1', name: 'Action', slug: 'action' }],
  } as unknown as Movie;


  const dummyEpisode = {
    id: 'ep-1',
    episodeNumber: 1,
    title: 'Pilot',
    description: 'Series begins',
    thumbnailUrl: 'thumb.jpg',
    durationMinutes: 50,
    season: {
      id: 'sea-1',
      seasonNumber: 1,
      series: {
        id: 's-1',
        title: 'Cyberpunk Odyssey',
        description: 'Future series',
        posterUrl: 'series-poster.jpg',
        backdropUrl: 'series-backdrop.jpg',
        genres: [{ id: 'g-2', name: 'Sci-Fi' }],
      },
    },
  } as unknown as Episode;

  beforeEach(async () => {
    mockWatchHistoryRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn((dto) => ({ ...dto, id: 'wh-new' })),
      save: jest.fn((entity) => Promise.resolve({ ...entity, id: entity.id || 'wh-1' })),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    mockProfileRepo = {
      findOne: jest.fn(),
    };
    mockMovieRepo = {
      findOne: jest.fn(),
    };
    mockEpisodeRepo = {
      findOne: jest.fn(),
    };
    mockRedisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchHistoryService,
        {
          provide: getRepositoryToken(WatchHistory),
          useValue: mockWatchHistoryRepo,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepo,
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepo,
        },
        {
          provide: getRepositoryToken(Episode),
          useValue: mockEpisodeRepo,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<WatchHistoryService>(WatchHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reportProgress', () => {
    it('should throw BadRequestException if neither movieId nor episodeId is provided', async () => {
      await expect(
        service.reportProgress({
          profileId: 'prof-1',
          positionSeconds: 100,
          durationSeconds: 1000,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if profile is not found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);
      await expect(
        service.reportProgress({
          profileId: 'prof-missing',
          movieId: 'm-1',
          positionSeconds: 100,
          durationSeconds: 1000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if movie is not found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(dummyProfile);
      mockMovieRepo.findOne.mockResolvedValue(null);

      await expect(
        service.reportProgress({
          profileId: 'prof-1',
          movieId: 'm-missing',
          positionSeconds: 100,
          durationSeconds: 1000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if episode is not found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(dummyProfile);
      mockEpisodeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.reportProgress({
          profileId: 'prof-1',
          episodeId: 'ep-missing',
          positionSeconds: 100,
          durationSeconds: 1000,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create new progress record if none exists', async () => {
      mockProfileRepo.findOne.mockResolvedValue(dummyProfile);
      mockMovieRepo.findOne.mockResolvedValue(dummyMovie);
      mockWatchHistoryRepo.findOne.mockResolvedValue(null);

      const result = await service.reportProgress({
        profileId: 'prof-1',
        movieId: 'm-1',
        positionSeconds: 500,
        durationSeconds: 1000,
      });

      expect(result).toBeDefined();
      expect(mockWatchHistoryRepo.create).toHaveBeenCalled();
      expect(mockWatchHistoryRepo.save).toHaveBeenCalled();
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'watch:progress:prof-1:m-1',
        expect.objectContaining({ positionSeconds: 500, progressPercentage: 50 }),
        86400,
      );
      expect(mockRedisService.del).toHaveBeenCalledWith('watch:continue:prof-1');
    });

    it('should update existing record and mark complete when progress >= 95%', async () => {
      mockProfileRepo.findOne.mockResolvedValue(dummyProfile);
      mockMovieRepo.findOne.mockResolvedValue(dummyMovie);
      const existingRecord = {
        id: 'wh-1',
        profileId: 'prof-1',
        movieId: 'm-1',
        positionSeconds: 100,
        durationSeconds: 1000,
        progressPercentage: 10,
        completed: false,
        lastWatchedAt: new Date(),
      } as WatchHistory;
      mockWatchHistoryRepo.findOne.mockResolvedValue(existingRecord);

      const result = await service.reportProgress({
        profileId: 'prof-1',
        movieId: 'm-1',
        positionSeconds: 960,
        durationSeconds: 1000,
      });

      expect(result.completed).toBe(true);
      expect(result.progressPercentage).toBe(96);
    });
  });

  describe('getContinueWatching', () => {
    it('should return cached items from Redis if present', async () => {
      const cached = { items: [{ contentId: 'm-1', title: 'Cached Movie' }], total: 1 };
      mockRedisService.get.mockResolvedValue(cached);

      const result = await service.getContinueWatching('prof-1');
      expect(result).toEqual(cached);
      expect(mockWatchHistoryRepo.find).not.toHaveBeenCalled();
    });

    it('should query DB, filter out position <= 10, map movies and episodes, and cache result', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const records = [
        {
          id: 'wh-1',
          profileId: 'prof-1',
          movieId: 'm-1',
          movie: dummyMovie,
          positionSeconds: 300,
          durationSeconds: 1800,
          progressPercentage: 16.67,
          completed: false,
          lastWatchedAt: new Date('2026-01-01T12:00:00Z'),
        },
        {
          id: 'wh-2',
          profileId: 'prof-1',
          episodeId: 'ep-1',
          episode: dummyEpisode,
          positionSeconds: 400,
          durationSeconds: 2400,
          progressPercentage: 16.67,
          completed: false,
          lastWatchedAt: new Date('2026-01-01T11:00:00Z'),
        },
        {
          id: 'wh-3',
          profileId: 'prof-1',
          movieId: 'm-2',
          positionSeconds: 5, // <= 10s should be excluded
          durationSeconds: 3600,
          progressPercentage: 0.1,
          completed: false,
          lastWatchedAt: new Date('2026-01-01T10:00:00Z'),
        },
      ];
      mockWatchHistoryRepo.find.mockResolvedValue(records);

      const result = await service.getContinueWatching('prof-1');
      expect(result.total).toBe(2);
      expect(result.items[0].contentId).toBe('m-1');
      expect(result.items[0].isSeries).toBe(false);
      expect(result.items[0].remainingMinutes).toBe(25);
      expect(result.items[1].isSeries).toBe(true);
      expect(result.items[1].title).toBe('Cyberpunk Odyssey');
      expect(result.items[1].subtitle).toBe('S1:E1 Pilot');
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'watch:continue:prof-1',
        expect.any(Object),
        60,
      );
    });
  });

  describe('getWatchHistory', () => {
    it('should return paginated watch history from database', async () => {
      const records = [
        {
          id: 'wh-1',
          profileId: 'prof-1',
          movieId: 'm-1',
          movie: dummyMovie,
          positionSeconds: 120,
          durationSeconds: 3600,
          progressPercentage: 3.33,
          completed: false,
          lastWatchedAt: new Date('2026-01-01T12:00:00Z'),
          createdAt: new Date('2026-01-01T12:00:00Z'),
          updatedAt: new Date('2026-01-01T12:00:00Z'),
        },
      ];
      mockWatchHistoryRepo.findAndCount.mockResolvedValue([records, 1]);

      const result = await service.getWatchHistory({ profileId: 'prof-1', page: 1, limit: 10 });
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('getResumePlayback', () => {
    it('should throw BadRequestException if neither movieId nor episodeId is provided', async () => {
      await expect(service.getResumePlayback('prof-1')).rejects.toThrow(BadRequestException);
    });

    it('should return cached playback progress from Redis if present', async () => {
      const cached = {
        contentId: 'm-1',
        positionSeconds: 600,
        durationSeconds: 1800,
        progressPercentage: 33.33,
        completed: false,
      };
      mockRedisService.get.mockResolvedValue(cached);

      const result = await service.getResumePlayback('prof-1', 'm-1');
      expect(result).toEqual(cached);
    });

    it('should query DB and return resume metadata if not in Redis', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const record = {
        id: 'wh-1',
        profileId: 'prof-1',
        movieId: 'm-1',
        positionSeconds: 750,
        durationSeconds: 1800,
        progressPercentage: 41.67,
        completed: false,
        lastWatchedAt: new Date('2026-01-01T12:00:00Z'),
      } as WatchHistory;
      mockWatchHistoryRepo.findOne.mockResolvedValue(record);

      const result = await service.getResumePlayback('prof-1', 'm-1');
      expect(result.positionSeconds).toBe(750);
      expect(result.progressPercentage).toBe(41.67);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'watch:progress:prof-1:m-1',
        expect.any(Object),
        86400,
      );
    });

    it('should return default 0 position if record does not exist in Redis or DB', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockWatchHistoryRepo.findOne.mockResolvedValue(null);

      const result = await service.getResumePlayback('prof-1', 'm-1');
      expect(result.positionSeconds).toBe(0);
      expect(result.completed).toBe(false);
    });
  });

  describe('removeFromWatchHistory', () => {
    it('should throw NotFoundException if entry is not found', async () => {
      mockWatchHistoryRepo.findOne.mockResolvedValue(null);
      await expect(service.removeFromWatchHistory('wh-missing', 'prof-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove entry and invalidate Redis cache', async () => {
      const record = { id: 'wh-1', profileId: 'prof-1', movieId: 'm-1' } as WatchHistory;
      mockWatchHistoryRepo.findOne.mockResolvedValue(record);

      const result = await service.removeFromWatchHistory('wh-1', 'prof-1');
      expect(result.success).toBe(true);
      expect(mockWatchHistoryRepo.remove).toHaveBeenCalledWith(record);
      expect(mockRedisService.del).toHaveBeenCalledWith('watch:continue:prof-1');
      expect(mockRedisService.del).toHaveBeenCalledWith('watch:progress:prof-1:m-1');
    });
  });

  describe('clearWatchHistory', () => {
    it('should remove all entries for profile and invalidate Redis', async () => {
      const records = [
        { id: 'wh-1', profileId: 'prof-1', movieId: 'm-1' },
        { id: 'wh-2', profileId: 'prof-1', episodeId: 'ep-1' },
      ] as WatchHistory[];
      mockWatchHistoryRepo.find.mockResolvedValue(records);

      const result = await service.clearWatchHistory('prof-1');
      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(2);
      expect(mockWatchHistoryRepo.remove).toHaveBeenCalledWith(records);
      expect(mockRedisService.del).toHaveBeenCalledWith('watch:continue:prof-1');
      expect(mockRedisService.del).toHaveBeenCalledWith('watch:progress:prof-1:m-1');
      expect(mockRedisService.del).toHaveBeenCalledWith('watch:progress:prof-1:ep-1');
    });
  });
});
