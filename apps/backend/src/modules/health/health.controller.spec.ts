import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockDbService: Partial<DatabaseService>;
  let mockRedisService: Partial<RedisService>;
  let mockStorageService: Partial<StorageService>;

  beforeEach(async () => {
    mockDbService = {
      checkHealth: jest.fn().mockResolvedValue({ status: 'up', latencyMs: 5 }),
    };

    mockRedisService = {
      checkHealth: jest.fn().mockResolvedValue({ status: 'up', latencyMs: 2 }),
    };

    mockStorageService = {
      checkHealth: jest.fn().mockResolvedValue({ status: 'up', latencyMs: 12, bucketsCount: 2 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: DatabaseService, useValue: mockDbService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return status ok when all infrastructure services are up', async () => {
    const result = await controller.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('up');
    expect(result.redis).toBe('up');
    expect(result.storage).toBe('up');
    expect(result.details.database.latencyMs).toBe(5);
    expect(result.details.redis.latencyMs).toBe(2);
    expect(result.details.storage.latencyMs).toBe(12);
  });

  it('should return degraded when one service is down', async () => {
    mockDbService.checkHealth = jest.fn().mockResolvedValue({
      status: 'down',
      message: 'Connection failed',
    });

    const result = await controller.check();
    expect(result.status).toBe('degraded');
    expect(result.database).toBe('down');
    expect(result.redis).toBe('up');
    expect(result.storage).toBe('up');
  });

  it('should return degraded when storage is unreachable', async () => {
    mockStorageService.checkHealth = jest.fn().mockResolvedValue({
      status: 'down',
      message: 'S3 endpoint timed out',
    });

    const result = await controller.check();
    expect(result.status).toBe('degraded');
    expect(result.database).toBe('up');
    expect(result.redis).toBe('up');
    expect(result.storage).toBe('down');
  });
});
