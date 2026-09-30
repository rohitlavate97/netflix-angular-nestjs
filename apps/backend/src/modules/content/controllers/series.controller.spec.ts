import { Test, TestingModule } from '@nestjs/testing';
import { SeriesController } from './series.controller';
import { SeriesService } from '../services/series.service';
import { ContentStatus } from '@netflix/shared-types';

describe('SeriesController', () => {
  let controller: SeriesController;
  let mockSeriesService: {
    findAll: jest.Mock;
    findBySlugOrId: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    addSeason: jest.Mock;
    addEpisode: jest.Mock;
    getSeasons: jest.Mock;
    getEpisodes: jest.Mock;
  };

  const dummySeries = {
    id: 'series-uuid-1',
    title: 'Stranger Things',
    slug: 'stranger-things',
    description: 'Hawkins Indiana...',
    releaseDate: '2016-07-15',
    ageRating: '16+',
    language: 'English',
    posterUrl: 'poster.jpg',
    backdropUrl: 'backdrop.jpg',
    status: ContentStatus.PUBLISHED,
    genres: [],
    seasons: [],
  };

  beforeEach(async () => {
    mockSeriesService = {
      findAll: jest.fn().mockResolvedValue([dummySeries]),
      findBySlugOrId: jest.fn().mockResolvedValue(dummySeries),
      create: jest.fn().mockResolvedValue(dummySeries),
      update: jest.fn().mockResolvedValue({ ...dummySeries, title: 'Updated' }),
      delete: jest.fn().mockResolvedValue(undefined),
      addSeason: jest.fn().mockResolvedValue({ id: 's-1', seasonNumber: 1, title: 'Season 1', episodes: [] }),
      addEpisode: jest.fn().mockResolvedValue({ id: 'e-1', episodeNumber: 1, title: 'Ep 1', durationMinutes: 45, thumbnailUrl: 't.jpg' }),
      getSeasons: jest.fn().mockResolvedValue([]),
      getEpisodes: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeriesController],
      providers: [{ provide: SeriesService, useValue: mockSeriesService }],
    }).compile();

    controller = module.get<SeriesController>(SeriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all series', async () => {
    const res = await controller.getSeries({});
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
  });

  it('should get single series', async () => {
    const res = await controller.getSingleSeries('stranger-things');
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe(dummySeries.id);
  });

  it('should create series', async () => {
    const res = await controller.createSeries({
      title: 'Stranger Things',
      description: 'Plot',
      releaseDate: '2016-07-15',
      posterUrl: 'poster.jpg',
      backdropUrl: 'backdrop.jpg',
    });
    expect(res.success).toBe(true);
    expect(res.data?.title).toBe('Stranger Things');
  });

  it('should add season', async () => {
    const res = await controller.addSeason('550e8400-e29b-41d4-a716-446655440001', {
      seasonNumber: 1,
      title: 'Season 1',
    });
    expect(res.success).toBe(true);
    expect(res.data?.seasonNumber).toBe(1);
  });

  it('should add episode', async () => {
    const res = await controller.addEpisode('550e8400-e29b-41d4-a716-446655440001', {
      episodeNumber: 1,
      title: 'Ep 1',
      thumbnailUrl: 't.jpg',
    });
    expect(res.success).toBe(true);
    expect(res.data?.episodeNumber).toBe(1);
  });
});
