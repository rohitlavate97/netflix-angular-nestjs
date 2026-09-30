import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { DatabaseService, DatabaseHealthResult } from '../database/database.service';
import { RedisService, RedisHealthResult } from '../redis/redis.service';
import { StorageService, StorageHealthResult } from '../storage/storage.service';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  database: 'up' | 'down';
  redis: 'up' | 'down';
  storage: 'up' | 'down';
  timestamp: string;
  details: {
    database: DatabaseHealthResult;
    redis: RedisHealthResult;
    storage: StorageHealthResult;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System Health Check probing Database, Redis, and Object Storage' })
  @SwaggerResponse({ status: 200, description: 'Service health status' })
  async check(): Promise<HealthCheckResponse> {
    const [dbHealth, redisHealth, storageHealth] = await Promise.all([
      this.databaseService.checkHealth(),
      this.redisService.checkHealth(),
      this.storageService.checkHealth(),
    ]);

    const isAllUp =
      dbHealth.status === 'up' && redisHealth.status === 'up' && storageHealth.status === 'up';

    return {
      status: isAllUp ? 'ok' : 'degraded',
      database: dbHealth.status,
      redis: redisHealth.status,
      storage: storageHealth.status,
      timestamp: new Date().toISOString(),
      details: {
        database: dbHealth,
        redis: redisHealth,
        storage: storageHealth,
      },
    };
  }
}
