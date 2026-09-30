import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT } from './storage.constants';
import { StorageService } from './storage.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const endpointHost = configService.get<string>('STORAGE_ENDPOINT', 'localhost');
        const endpointPort = configService.get<number>('STORAGE_PORT', 9000);
        const useSSL = configService.get<string>('STORAGE_USE_SSL') === 'true';
        const protocol = useSSL ? 'https' : 'http';
        const endpoint = `${protocol}://${endpointHost}:${endpointPort}`;

        const accessKeyId = configService.get<string>('STORAGE_ACCESS_KEY', 'minioadmin');
        const secretAccessKey = configService.get<string>('STORAGE_SECRET_KEY', 'minioadmin');

        return new S3Client({
          endpoint,
          region: 'us-east-1',
          forcePathStyle: true,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      },
    },
    StorageService,
  ],
  exports: [S3_CLIENT, StorageService],
})
export class StorageModule {}
