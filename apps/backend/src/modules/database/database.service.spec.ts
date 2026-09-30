import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let isInit: boolean;
  let mockDataSource: {
    isInitialized: boolean;
    query: jest.Mock;
  };

  beforeEach(async () => {
    isInit = true;
    mockDataSource = {
      get isInitialized() {
        return isInit;
      },
      query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return up status when query succeeds', async () => {
    const health = await service.checkHealth();
    expect(health.status).toBe('up');
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    expect(mockDataSource.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('should return down status when query fails', async () => {
    mockDataSource.query.mockRejectedValueOnce(new Error('Connection lost'));
    const health = await service.checkHealth();
    expect(health.status).toBe('down');
    expect(health.message).toBe('Connection lost');
  });

  it('should return down status if DataSource is not initialized', async () => {
    isInit = false;
    const health = await service.checkHealth();
    expect(health.status).toBe('down');
    expect(health.message).toBe('Database connection is not initialized');
  });
});
