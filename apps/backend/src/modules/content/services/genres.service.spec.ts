import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { GenresService } from './genres.service';
import { Genre } from '../../../database/entities/genre.entity';

describe('GenresService', () => {
  let service: GenresService;
  let mockGenreRepo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    mockGenreRepo = {
      find: jest.fn().mockResolvedValue([{ id: 'g-1', name: 'Action', slug: 'action' }]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => ({ id: 'g-1', ...d })),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'g-1', ...d })),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        { provide: getRepositoryToken(Genre), useValue: mockGenreRepo },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all genres', async () => {
    const genres = await service.findAll();
    expect(genres).toHaveLength(1);
    expect(genres[0].slug).toBe('action');
  });

  it('should find genre by slug', async () => {
    mockGenreRepo.findOne.mockResolvedValueOnce({ id: 'g-1', name: 'Action', slug: 'action' });
    const genre = await service.findBySlug('action');
    expect(genre.name).toBe('Action');
  });

  it('should throw NotFoundException if genre slug not found', async () => {
    mockGenreRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.findBySlug('unknown')).rejects.toThrow(NotFoundException);
  });

  it('should create new genre', async () => {
    mockGenreRepo.findOne.mockResolvedValueOnce(null);
    const genre = await service.create({ name: 'Documentary' });
    expect(genre.name).toBe('Documentary');
    expect(genre.slug).toBe('documentary');
  });

  it('should throw ConflictException if genre slug exists', async () => {
    mockGenreRepo.findOne.mockResolvedValueOnce({ id: 'g-1', slug: 'action' });
    await expect(service.create({ name: 'Action' })).rejects.toThrow(ConflictException);
  });
});
