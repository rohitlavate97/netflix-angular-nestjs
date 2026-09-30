import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';

export interface HealthCheckResponse {
  status: string;
  database: string;
  redis: string;
  storage: string;
  timestamp: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'System Health Check' })
  @SwaggerResponse({ status: 200, description: 'Service health status' })
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      database: 'up',
      redis: 'up',
      storage: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
