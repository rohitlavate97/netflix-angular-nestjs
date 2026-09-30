import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from '../services/categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockCategoriesService: {
    findAll: jest.Mock;
    getHomeFeed: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };

  const dummyCategory = {
    id: 'c-1',
    name: 'Trending Now',
    slug: 'trending-now',
    displayOrder: 1,
    isActive: true,
  };

  beforeEach(async () => {
    mockCategoriesService = {
      findAll: jest.fn().mockResolvedValue([dummyCategory]),
      getHomeFeed: jest.fn().mockResolvedValue([
        {
          category: dummyCategory,
          movies: [],
          series: [],
        },
      ]),
      create: jest.fn().mockResolvedValue(dummyCategory),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockCategoriesService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all categories', async () => {
    const res = await controller.getCategories();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
  });

  it('should get home feed rows', async () => {
    const res = await controller.getHomeFeed();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
    expect(res.data?.[0].category.slug).toBe('trending-now');
  });

  it('should create category', async () => {
    const res = await controller.createCategory({ name: 'Trending Now' });
    expect(res.success).toBe(true);
    expect(res.data?.slug).toBe('trending-now');
  });

  it('should delete category', async () => {
    const res = await controller.deleteCategory('550e8400-e29b-41d4-a716-446655440001');
    expect(res.success).toBe(true);
    expect(res.data?.deleted).toBe(true);
  });
});
