import { Injectable, Logger, Optional } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface DatabaseHealthResult {
  status: 'up' | 'down';
  latencyMs?: number;
  message?: string;
}

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Optional() private readonly dataSource?: DataSource) {}

  async checkHealth(): Promise<DatabaseHealthResult> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return {
        status: 'down',
        message: 'Database connection is not initialized',
      };
    }

    const start = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
      const latencyMs = Date.now() - start;
      return {
        status: 'up',
        latencyMs,
      };
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : 'Unknown database error';
      this.logger.warn(`Database health check failed: ${errMessage}`);
      return {
        status: 'down',
        message: errMessage,
      };
    }
  }
}
