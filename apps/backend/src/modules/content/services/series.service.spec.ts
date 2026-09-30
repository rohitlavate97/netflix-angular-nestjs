import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SeriesService } from './series.service';
import { Series } from '../../../database/entities/series.entity';
import { Season } from '../../../database/entities/season.entity';
import { Episode } from '../../../database/entities/episode.entity';
import { Genre } from '../../../database/entities/genre.entity';
import { ContentStatus } from '@netflix/shared-types';

describe('SeriesService', () => {
  let service: SeriesService;
  let mockSeriesRepo: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let mockSeasonRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockEpisodeRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockGenreRepo: {
    find: jest.Mock;
  };

  const dummySeries = (overrides = {}): Series =>
    ({
      id: 'series-uuid-1',
      title: 'Stranger Things',
      slug: 'stranger-things',
      description: 'Hawkins Indiana 1983...',
      releaseDate: new Date('2016-07-15'),
      ageRating: '16+',
      language: 'English',
      posterUrl: 'poster.jpg',
      backdropUrl: 'backdrop.jpg',
      trailerUrl: 'trailer.mp4',
      status: ContentStatus.PUBLISHED,
      genres: [{ id: 'genre-1', name: 'Sci-Fi', slug: 'sci-fi' }],
      seasons: [
        {
          id: 'season-1',
          seriesId: 'series-uuid-1',
          seasonNumber: 1,
          title: 'Season 1',
          episodes: [
            {
              id: 'ep-1',
              seasonId: 'season-1',
              episodeNumber: 1,
              title: 'Chapter One',
              durationMinutes: 48,
              thumbnailUrl: 'thumb.jpg',
              mediaAsset: undefined,
            },
          ],
        },
      ],
      ...overrides,
    }) as unknown as Series;

  beforeEach(async () => {
    const qbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([dummySeries()]),
    };

    mockSeriesRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 'series-uuid-1', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'series-uuid-1', ...d })),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    mockSeasonRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 'season-uuid-1', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'season-uuid-1', ...d })),
    };

    mockEpisodeRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 'episode-uuid-1', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'episode-uuid-1', ...d })),
    };

    mockGenreRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        { provide: getRepositoryToken(Series), useValue: mockSeriesRepo },
        { provide: getRepositoryToken(Season), useValue: mockSeasonRepo },
        { provide: getRepositoryToken(Episode), useValue: mockEpisodeRepo },
        { provide: getRepositoryToken(Genre), useValue: mockGenreRepo },
      ],
    }).compile();

    service = module.get<SeriesService>(SeriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return list of series with seasons', async () => {
      const results = await service.findAll();
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Stranger Things');
      expect(results[0].seasons).toHaveLength(1);
    });
  });

  describe('findBySlugOrId', () => {
    it('should return series by slug', async () => {
      mockSeriesRepo.findOne.mockResolvedValueOnce(dummySeries());
      const result = await service.findBySlugOrId('stranger-things');
      expect(result.slug).toBe('stranger-things');
    });

    it('should throw NotFoundException if not found', async () => {
      mockSeriesRepo.findOne.mockResolvedValueOnce(null);
      await expect(service.findBySlugOrId('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addSeason', () => {
    it('should add season to series', async () => {
      mockSeriesRepo.findOne.mockResolvedValueOnce(dummySeries());
      mockSeasonRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.addSeason('series-uuid-1', {
        seasonNumber: 2,
        title: 'Season 2',
      });

      expect(result.seasonNumber).toBe(2);
      expect(mockSeasonRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if season number exists', async () => {
      mockSeriesRepo.findOne.mockResolvedValueOnce(dummySeries());
      mockSeasonRepo.findOne.mockResolvedValueOnce({ id: 'existing-season' });

      await expect(
        service.addSeason('series-uuid-1', { seasonNumber: 1, title: 'Duplicate' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('addEpisode', () => {
    it('should add episode to season', async () => {
      mockSeasonRepo.findOne.mockResolvedValueOnce({ id: 'season-1', title: 'Season 1' });
      mockEpisodeRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.addEpisode('season-1', {
        episodeNumber: 2,
        title: 'The Weirdo on Maple Street',
        durationMinutes: 50,
        thumbnailUrl: 'thumb2.jpg',
      });

      expect(result.episodeNumber).toBe(2);
      expect(mockEpisodeRepo.save).toHaveBeenCalled();
    });
  });
});
