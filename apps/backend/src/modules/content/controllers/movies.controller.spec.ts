import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from '../services/movies.service';
import { ContentStatus } from '@netflix/shared-types';

describe('MoviesController', () => {
  let controller: MoviesController;
  let mockMoviesService: {
    findAll: jest.Mock;
    findBySlugOrId: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const dummyMovie = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Interstellar',
    slug: 'interstellar-2014',
    description: 'A team of explorers...',
    releaseDate: '2014-11-07',
    durationMinutes: 169,
    ageRating: '13+',
    language: 'English',
    country: 'USA',
    posterUrl: 'poster.jpg',
    backdropUrl: 'backdrop.jpg',
    status: ContentStatus.PUBLISHED,
    viewCount: 100,
    averageRating: 4.8,
    genres: [],
  };

  beforeEach(async () => {
    mockMoviesService = {
      findAll: jest.fn().mockResolvedValue([dummyMovie]),
      findBySlugOrId: jest.fn().mockResolvedValue(dummyMovie),
      create: jest.fn().mockResolvedValue(dummyMovie),
      update: jest.fn().mockResolvedValue({ ...dummyMovie, title: 'Updated' }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all movies', async () => {
    const res = await controller.getMovies({});
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.data?.[0].title).toBe('Interstellar');
  });

  it('should get movie by identifier', async () => {
    const res = await controller.getMovie('interstellar-2014');
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe(dummyMovie.id);
  });

  it('should create movie', async () => {
    const res = await controller.createMovie({
      title: 'Interstellar',
      description: 'Plot',
      releaseDate: '2014-11-07',
      durationMinutes: 169,
      posterUrl: 'poster.jpg',
      backdropUrl: 'backdrop.jpg',
    });
    expect(res.success).toBe(true);
    expect(res.data?.title).toBe('Interstellar');
  });

  it('should update movie', async () => {
    const res = await controller.updateMovie(dummyMovie.id, { title: 'Updated' });
    expect(res.success).toBe(true);
    expect(res.data?.title).toBe('Updated');
  });

  it('should delete movie', async () => {
    const res = await controller.deleteMovie(dummyMovie.id);
    expect(res.success).toBe(true);
    expect(res.data?.deleted).toBe(true);
  });
});
