import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { S3_CLIENT } from './storage.constants';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://storage.local/presigned-url'),
}));

describe('StorageService', () => {
  let service: StorageService;
  let mockS3Client: {
    send: jest.Mock;
  };

  beforeEach(async () => {
    mockS3Client = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: S3_CLIENT,
          useValue: mockS3Client,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      mockS3Client.send.mockResolvedValueOnce({});
      const result = await service.uploadFile(
        'test-bucket',
        'video.mp4',
        Buffer.from('data'),
        'video/mp4',
      );
      expect(result).toEqual({
        bucket: 'test-bucket',
        key: 'video.mp4',
        location: 'test-bucket/video.mp4',
      });
      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully and return true', async () => {
      mockS3Client.send.mockResolvedValueOnce({});
      const result = await service.deleteFile('test-bucket', 'old-file.txt');
      expect(result).toBe(true);
    });

    it('should return false when deletion encounters an error', async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error('S3 error'));
      const result = await service.deleteFile('test-bucket', 'missing-file.txt');
      expect(result).toBe(false);
    });
  });

  describe('checkHealth', () => {
    it('should report up when ListBuckets succeeds', async () => {
      mockS3Client.send.mockResolvedValueOnce({
        Buckets: [{ Name: 'netflix-media' }, { Name: 'netflix-thumbnails' }],
      });
      const health = await service.checkHealth();
      expect(health.status).toBe('up');
      expect(health.bucketsCount).toBe(2);
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should report down when ListBuckets fails', async () => {
      mockS3Client.send.mockRejectedValueOnce(new Error('Connection refused to storage'));
      const health = await service.checkHealth();
      expect(health.status).toBe('down');
      expect(health.message).toContain('Connection refused');
    });
  });
});
