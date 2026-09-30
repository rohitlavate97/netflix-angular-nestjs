import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo(): { name: string; version: string; status: string } {
    return {
      name: 'Netflix Clone Streaming API',
      version: '1.0.0',
      status: 'operational',
    };
  }
}
