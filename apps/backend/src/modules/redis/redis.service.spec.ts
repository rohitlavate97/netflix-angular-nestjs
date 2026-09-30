import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

describe('RedisService', () => {
  let service: RedisService;
  let mockRedisClient: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    exists: jest.Mock;
    ping: jest.Mock;
    flushall: jest.Mock;
    quit: jest.Mock;
    status: string;
  };

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ping: jest.fn(),
      flushall: jest.fn(),
      quit: jest.fn(),
      status: 'ready',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return parsed JSON object when key exists', async () => {
      const mockValue = { id: 'movie-1', title: 'The Last Horizon' };
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockValue));

      const result = await service.get('movie:1');
      expect(result).toEqual(mockValue);
      expect(mockRedisClient.get).toHaveBeenCalledWith('movie:1');
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValueOnce(null);

      const result = await service.get('movie:nonexistent');
      expect(result).toBeNull();
    });

    it('should handle errors gracefully and return null', async () => {
      mockRedisClient.get.mockRejectedValueOnce(new Error('Redis connection failure'));

      const result = await service.get('any-key');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should store value with TTL when specified', async () => {
      await service.set('cache:test', { active: true }, 300);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'cache:test',
        JSON.stringify({ active: true }),
        'EX',
        300,
      );
    });

    it('should store value without TTL when ttl is omitted', async () => {
      await service.set('cache:permanent', 'static-value');
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'cache:permanent',
        JSON.stringify('static-value'),
      );
    });
  });

  describe('del and exists', () => {
    it('should delete key and return deleted count', async () => {
      mockRedisClient.del.mockResolvedValueOnce(1);
      const deletedCount = await service.del('test:key');
      expect(deletedCount).toBe(1);
    });

    it('should check existence of key', async () => {
      mockRedisClient.exists.mockResolvedValueOnce(1);
      const exists = await service.exists('test:key');
      expect(exists).toBe(true);
    });
  });

  describe('checkHealth', () => {
    it('should return up status on PONG', async () => {
      mockRedisClient.ping.mockResolvedValueOnce('PONG');
      const health = await service.checkHealth();
      expect(health.status).toBe('up');
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should return down status on Redis failure', async () => {
      mockRedisClient.ping.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      const health = await service.checkHealth();
      expect(health.status).toBe('down');
      expect(health.message).toContain('ECONNREFUSED');
    });
  });
});
