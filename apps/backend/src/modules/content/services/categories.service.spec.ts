import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '../../../database/entities/category.entity';
import { MoviesService } from './movies.service';
import { SeriesService } from './series.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockCategoryRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let mockMoviesService: {
    findAll: jest.Mock;
  };
  let mockSeriesService: {
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    mockCategoryRepo = {
      find: jest.fn().mockResolvedValue([
        { id: 'cat-1', name: 'Trending Now', slug: 'trending-now', displayOrder: 1, isActive: true },
      ]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 'cat-1', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'cat-1', ...d })),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    mockMoviesService = {
      findAll: jest.fn().mockResolvedValue([{ id: 'm-1', title: 'Top Movie' }]),
    };

    mockSeriesService = {
      findAll: jest.fn().mockResolvedValue([{ id: 's-1', title: 'Top Series' }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
        { provide: MoviesService, useValue: mockMoviesService },
        { provide: SeriesService, useValue: mockSeriesService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return active categories sorted by displayOrder', async () => {
    const categories = await service.findAll();
    expect(categories).toHaveLength(1);
    expect(categories[0].slug).toBe('trending-now');
  });

  it('should create new category', async () => {
    mockCategoryRepo.findOne.mockResolvedValueOnce(null);
    const category = await service.create({ name: 'Popular Series', displayOrder: 2 });
    expect(category.name).toBe('Popular Series');
    expect(category.slug).toBe('popular-series');
  });

  it('should throw ConflictException if category slug exists', async () => {
    mockCategoryRepo.findOne.mockResolvedValueOnce({ id: 'cat-1', slug: 'trending-now' });
    await expect(service.create({ name: 'Trending Now' })).rejects.toThrow(ConflictException);
  });

  it('should generate homepage feed rows with movies and series', async () => {
    const feed = await service.getHomeFeed();
    expect(feed).toHaveLength(1);
    expect(feed[0].category.slug).toBe('trending-now');
    expect(feed[0].movies).toHaveLength(1);
    expect(feed[0].series).toHaveLength(1);
  });
});
