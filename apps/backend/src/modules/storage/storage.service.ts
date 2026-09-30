import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListBucketsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_CLIENT } from './storage.constants';

export interface StorageHealthResult {
  status: 'up' | 'down';
  latencyMs?: number;
  message?: string;
  bucketsCount?: number;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(@Inject(S3_CLIENT) private readonly s3Client: S3Client) {}

  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer | Uint8Array | string,
    contentType?: string,
  ): Promise<{ bucket: string; key: string; location: string }> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      return {
        bucket,
        key,
        location: `${bucket}/${key}`,
      };
    } catch (err) {
      this.logger.error(`Error uploading file to storage [${bucket}/${key}]`, err);
      throw err;
    }
  }

  async getSignedDownloadUrl(
    bucket: string,
    key: string,
    expiresInSeconds: number = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    } catch (err) {
      this.logger.error(`Error generating signed download URL for [${bucket}/${key}]`, err);
      throw err;
    }
  }

  async deleteFile(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch (err) {
      this.logger.error(`Error deleting file from storage [${bucket}/${key}]`, err);
      return false;
    }
  }

  async checkHealth(): Promise<StorageHealthResult> {
    const start = Date.now();
    try {
      const command = new ListBucketsCommand({});
      const response = await this.s3Client.send(command);
      return {
        status: 'up',
        latencyMs: Date.now() - start,
        bucketsCount: response.Buckets?.length ?? 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Object Storage error';
      this.logger.warn(`Storage health check failed: ${message}`);
      return {
        status: 'down',
        message,
      };
    }
  }
}
