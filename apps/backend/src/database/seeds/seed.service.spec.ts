import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { SeedService } from './seed.service';

describe('SeedService', () => {
  let service: SeedService;
  let mockManager: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let mockDataSource: {
    transaction: jest.Mock;
  };

  beforeEach(async () => {
    mockManager = {
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([{ id: 'g-1', slug: 'sci-fi' }]),
      create: jest.fn().mockImplementation((_entity, data) => ({ id: 'mock-id', ...data })),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return await callback(mockManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed all datasets when database is empty', async () => {
    const counts = await service.runSeed();
    expect(mockDataSource.transaction).toHaveBeenCalled();
    expect(counts.genres).toBeGreaterThan(0);
    expect(counts.categories).toBeGreaterThan(0);
    expect(counts.plans).toBeGreaterThan(0);
    expect(counts.users).toBeGreaterThan(0);
    expect(counts.movies).toBeGreaterThan(0);
    expect(counts.series).toBeGreaterThan(0);
  });

  it('should be idempotent and not duplicate existing items', async () => {
    mockManager.findOne.mockResolvedValue({ id: 'already-exists' });
    const counts = await service.runSeed();
    expect(counts.genres).toBe(0);
    expect(counts.categories).toBe(0);
    expect(counts.plans).toBe(0);
    expect(counts.users).toBe(0);
    expect(counts.movies).toBe(0);
    expect(counts.series).toBe(0);
  });
});
