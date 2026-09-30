import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from './genres.controller';
import { GenresService } from '../services/genres.service';

describe('GenresController', () => {
  let controller: GenresController;
  let mockGenresService: {
    findAll: jest.Mock;
    findBySlug: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };

  const dummyGenre = { id: 'g-1', name: 'Action', slug: 'action' };

  beforeEach(async () => {
    mockGenresService = {
      findAll: jest.fn().mockResolvedValue([dummyGenre]),
      findBySlug: jest.fn().mockResolvedValue(dummyGenre),
      create: jest.fn().mockResolvedValue(dummyGenre),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [{ provide: GenresService, useValue: mockGenresService }],
    }).compile();

    controller = module.get<GenresController>(GenresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all genres', async () => {
    const res = await controller.getGenres();
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(1);
  });

  it('should get genre by slug', async () => {
    const res = await controller.getGenreBySlug('action');
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe('Action');
  });

  it('should create genre', async () => {
    const res = await controller.createGenre({ name: 'Action' });
    expect(res.success).toBe(true);
    expect(res.data?.slug).toBe('action');
  });

  it('should delete genre', async () => {
    const res = await controller.deleteGenre('550e8400-e29b-41d4-a716-446655440001');
    expect(res.success).toBe(true);
    expect(res.data?.deleted).toBe(true);
  });
});
