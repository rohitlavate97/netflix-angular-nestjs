import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiResponse } from '@netflix/shared-types';

@ApiTags('Root')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Platform status and version metadata' })
  getRoot(): ApiResponse<{ name: string; version: string; status: string }> {
    return {
      success: true,
      data: this.appService.getAppInfo(),
      message: 'Netflix Clone API Service is online',
    };
  }
}
