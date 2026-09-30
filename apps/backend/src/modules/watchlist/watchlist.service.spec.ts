import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { Watchlist } from '../../database/entities/watchlist.entity';
import { Movie } from '../../database/entities/movie.entity';
import { Series } from '../../database/entities/series.entity';
import { Profile } from '../../database/entities/profile.entity';
import { ContentStatus } from '@netflix/shared-types';

describe('WatchlistService', () => {
  let service: WatchlistService;
  let mockWatchlistRepo: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let mockMovieRepo: {
    findOne: jest.Mock;
  };
  let mockSeriesRepo: {
    findOne: jest.Mock;
  };
  let mockProfileRepo: {
    findOne: jest.Mock;
  };

  const dummyProfile = {
    id: 'p-1',
    name: 'Rohit',
    userId: 'u-1',
  } as Profile;

  const dummyMovie = {
    id: 'm-1',
    title: 'Shadow Protocol',
    slug: 'shadow-protocol',
    description: 'Cyber thriller',
    releaseDate: new Date('2025-01-01'),
    durationMinutes: 120,
    ageRating: '16+',
    posterUrl: 'poster.jpg',
    backdropUrl: 'backdrop.jpg',
    status: ContentStatus.PUBLISHED,
    averageRating: 4.8,
    genres: [{ id: 'g-1', name: 'Sci-Fi', slug: 'sci-fi' }],
  } as unknown as Movie;

  const dummySeries = {
    id: 's-1',
    title: 'Neon Horizon',
    slug: 'neon-horizon',
    description: 'Cyberpunk series',
    releaseDate: new Date('2025-02-01'),
    ageRating: '18+',
    posterUrl: 'poster.jpg',
    backdropUrl: 'backdrop.jpg',
    status: ContentStatus.PUBLISHED,
    genres: [{ id: 'g-1', name: 'Sci-Fi', slug: 'sci-fi' }],
    seasons: [],
  } as unknown as Series;

  const dummyWatchlistEntry = {
    id: 'w-1',
    profileId: 'p-1',
    movieId: 'm-1',
    movie: dummyMovie,
    createdAt: new Date('2025-03-01'),
  } as Watchlist;

  beforeEach(async () => {
    const qbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[dummyWatchlistEntry], 1]),
      getOne: jest.fn().mockResolvedValue(dummyWatchlistEntry),
    };

    mockWatchlistRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((d) => ({ id: 'w-new', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'w-new', ...d })),
      remove: jest.fn().mockResolvedValue(dummyWatchlistEntry),
    };

    mockMovieRepo = {
      findOne: jest.fn().mockResolvedValue(dummyMovie),
    };

    mockSeriesRepo = {
      findOne: jest.fn().mockResolvedValue(dummySeries),
    };

    mockProfileRepo = {
      findOne: jest.fn().mockResolvedValue(dummyProfile),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchlistService,
        { provide: getRepositoryToken(Watchlist), useValue: mockWatchlistRepo },
        { provide: getRepositoryToken(Movie), useValue: mockMovieRepo },
        { provide: getRepositoryToken(Series), useValue: mockSeriesRepo },
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepo },
      ],
    }).compile();

    service = module.get<WatchlistService>(WatchlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get paginated watchlist for a profile', async () => {
    const res = await service.getWatchlist({ profileId: 'p-1', page: 1, limit: 10 });
    expect(res.items.length).toBe(1);
    expect(res.total).toBe(1);
    expect(res.items[0].movieId).toBe('m-1');
  });

  it('should throw NotFoundException if profile does not exist when adding', async () => {
    mockProfileRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.addToWatchlist({ profileId: 'invalid-p', contentId: 'm-1', contentType: 'movie' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if movie does not exist when adding', async () => {
    mockMovieRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.addToWatchlist({ profileId: 'p-1', contentId: 'invalid-m', contentType: 'movie' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should add movie to watchlist when valid', async () => {
    const res = await service.addToWatchlist({
      profileId: 'p-1',
      contentId: 'm-1',
      contentType: 'movie',
    });
    expect(mockWatchlistRepo.create).toHaveBeenCalledWith({ profileId: 'p-1', movieId: 'm-1' });
    expect(mockWatchlistRepo.save).toHaveBeenCalled();
    expect(res.profileId).toBe('p-1');
    expect(res.movieId).toBe('m-1');
  });

  it('should return existing entry idempotently when movie is already in watchlist', async () => {
    mockWatchlistRepo.findOne.mockResolvedValueOnce(dummyWatchlistEntry);
    const res = await service.addToWatchlist({
      profileId: 'p-1',
      contentId: 'm-1',
      contentType: 'movie',
    });
    expect(mockWatchlistRepo.save).not.toHaveBeenCalled();
    expect(res.id).toBe('w-1');
  });

  it('should add series to watchlist when valid', async () => {
    const res = await service.addToWatchlist({
      profileId: 'p-1',
      contentId: 's-1',
      contentType: 'series',
    });
    expect(mockWatchlistRepo.create).toHaveBeenCalledWith({ profileId: 'p-1', seriesId: 's-1' });
    expect(mockWatchlistRepo.save).toHaveBeenCalled();
    expect(res.seriesId).toBe('s-1');
  });

  it('should remove item from watchlist', async () => {
    const res = await service.removeFromWatchlist('p-1', 'm-1');
    expect(mockWatchlistRepo.remove).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  it('should throw NotFoundException when removing non-existent item', async () => {
    const qbMock = mockWatchlistRepo.createQueryBuilder();
    qbMock.getOne.mockResolvedValueOnce(null);

    await expect(service.removeFromWatchlist('p-1', 'invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should check if item is in watchlist', async () => {
    const res = await service.checkInWatchlist('p-1', 'm-1');
    expect(res.inWatchlist).toBe(true);
    expect(res.watchlistItemId).toBe('w-1');
  });
});
