import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from '../../../database/entities/movie.entity';
import { Genre } from '../../../database/entities/genre.entity';
import { ContentStatus } from '@netflix/shared-types';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockMovieRepo: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    increment: jest.Mock;
  };
  let mockGenreRepo: {
    find: jest.Mock;
  };

  const dummyMovie = (overrides = {}): Movie =>
    ({
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Interstellar',
      slug: 'interstellar-2014',
      description: 'A team of explorers travel through a wormhole...',
      releaseDate: new Date('2014-11-07'),
      durationMinutes: 169,
      ageRating: '13+',
      language: 'English',
      country: 'USA',
      posterUrl: 'https://assets.streamflix.local/posters/interstellar.jpg',
      backdropUrl: 'https://assets.streamflix.local/backdrops/interstellar.jpg',
      trailerUrl: 'https://youtube.com/watch?v=zSWdZVtXT7E',
      status: ContentStatus.PUBLISHED,
      viewCount: 15400,
      averageRating: 4.8,
      genres: [{ id: 'genre-uuid', name: 'Sci-Fi', slug: 'sci-fi' }],
      mediaAsset: undefined,
      ...overrides,
    }) as unknown as Movie;

  beforeEach(async () => {
    const qbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([dummyMovie()]),
    };

    mockMovieRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: '550e8400-e29b-41d4-a716-446655440001', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: '550e8400-e29b-41d4-a716-446655440001', ...d })),
      remove: jest.fn().mockResolvedValue(undefined),
      increment: jest.fn().mockResolvedValue(undefined),
    };

    mockGenreRepo = {
      find: jest.fn().mockResolvedValue([{ id: 'genre-uuid', name: 'Sci-Fi', slug: 'sci-fi' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepo,
        },
        {
          provide: getRepositoryToken(Genre),
          useValue: mockGenreRepo,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of MovieDto', async () => {
      const results = await service.findAll({ search: 'Interstellar' });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Interstellar');
      expect(results[0].genres).toHaveLength(1);
    });
  });

  describe('findBySlugOrId', () => {
    it('should return movie by UUID', async () => {
      mockMovieRepo.findOne.mockResolvedValueOnce(dummyMovie());
      const result = await service.findBySlugOrId('550e8400-e29b-41d4-a716-446655440001');

      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.title).toBe('Interstellar');
    });

    it('should return movie by slug', async () => {
      mockMovieRepo.findOne.mockResolvedValueOnce(dummyMovie());
      const result = await service.findBySlugOrId('interstellar-2014');

      expect(result.slug).toBe('interstellar-2014');
    });

    it('should throw NotFoundException if not found', async () => {
      mockMovieRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.findBySlugOrId('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create movie successfully', async () => {
      mockMovieRepo.findOne
        .mockResolvedValueOnce(null) // Check existing slug
        .mockResolvedValueOnce(dummyMovie()); // Return saved entity on find

      const result = await service.create({
        title: 'New Sci-Fi Movie',
        description: 'Plot description',
        releaseDate: '2026-05-01',
        durationMinutes: 120,
        posterUrl: 'https://assets.streamflix.local/posters/scifi.jpg',
        backdropUrl: 'https://assets.streamflix.local/backdrops/scifi.jpg',
        genreIds: ['genre-uuid'],
      });

      expect(result.title).toBe('Interstellar');
      expect(mockMovieRepo.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if slug exists', async () => {
      mockMovieRepo.findOne.mockResolvedValueOnce(dummyMovie());

      await expect(
        service.create({
          title: 'Interstellar',
          description: 'Plot',
          releaseDate: '2014-11-07',
          durationMinutes: 169,
          posterUrl: 'poster.jpg',
          backdropUrl: 'backdrop.jpg',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update movie attributes', async () => {
      mockMovieRepo.findOne
        .mockResolvedValueOnce(dummyMovie())
        .mockResolvedValueOnce(dummyMovie({ title: 'Interstellar IMAX' }));

      const result = await service.update('550e8400-e29b-41d4-a716-446655440001', {
        title: 'Interstellar IMAX',
      });

      expect(result.title).toBe('Interstellar IMAX');
    });
  });

  describe('delete', () => {
    it('should remove movie', async () => {
      mockMovieRepo.findOne.mockResolvedValueOnce(dummyMovie());

      await expect(
        service.delete('550e8400-e29b-41d4-a716-446655440001'),
      ).resolves.toBeUndefined();
      expect(mockMovieRepo.remove).toHaveBeenCalled();
    });
  });

  describe('incrementViewCount', () => {
    it('should call repository increment', async () => {
      await service.incrementViewCount('550e8400-e29b-41d4-a716-446655440001');
      expect(mockMovieRepo.increment).toHaveBeenCalledWith(
        { id: '550e8400-e29b-41d4-a716-446655440001' },
        'viewCount',
        1,
      );
    });
  });
});
