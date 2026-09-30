import { Test, TestingModule } from '@nestjs/testing';
import { WatchHistoryController } from './watch-history.controller';
import { WatchHistoryService } from './watch-history.service';

describe('WatchHistoryController', () => {
  let controller: WatchHistoryController;
  let mockWatchHistoryService: {
    reportProgress: jest.Mock;
    getContinueWatching: jest.Mock;
    getResumePlayback: jest.Mock;
    getWatchHistory: jest.Mock;
    removeFromWatchHistory: jest.Mock;
    clearWatchHistory: jest.Mock;
  };

  beforeEach(async () => {
    mockWatchHistoryService = {
      reportProgress: jest.fn().mockResolvedValue({ id: 'wh-1', positionSeconds: 120 }),
      getContinueWatching: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      getResumePlayback: jest.fn().mockResolvedValue({ positionSeconds: 120, completed: false }),
      getWatchHistory: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
      removeFromWatchHistory: jest.fn().mockResolvedValue({ success: true, message: 'Removed' }),
      clearWatchHistory: jest.fn().mockResolvedValue({ success: true, message: 'Cleared', deletedCount: 5 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchHistoryController],
      providers: [
        {
          provide: WatchHistoryService,
          useValue: mockWatchHistoryService,
        },
      ],
    }).compile();

    controller = module.get<WatchHistoryController>(WatchHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should report progress', async () => {
    const dto = {
      profileId: '11111111-1111-1111-1111-111111111111',
      movieId: '22222222-2222-2222-2222-222222222222',
      positionSeconds: 120,
      durationSeconds: 3600,
    };
    const response = await controller.reportProgress(dto);
    expect(response.success).toBe(true);
    expect(mockWatchHistoryService.reportProgress).toHaveBeenCalledWith(dto);
  });

  it('should get continue watching', async () => {
    const response = await controller.getContinueWatching('11111111-1111-1111-1111-111111111111');
    expect(response.success).toBe(true);
    expect(mockWatchHistoryService.getContinueWatching).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
    );
  });

  it('should get resume playback', async () => {
    const response = await controller.getResumePlayback(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
    );
    expect(response.success).toBe(true);
    expect(mockWatchHistoryService.getResumePlayback).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      undefined,
    );
  });

  it('should get watch history', async () => {
    const query = { profileId: '11111111-1111-1111-1111-111111111111', page: 1, limit: 10 };
    const response = await controller.getWatchHistory(query);
    expect(response.success).toBe(true);
    expect(mockWatchHistoryService.getWatchHistory).toHaveBeenCalledWith(query);
  });

  it('should remove from watch history', async () => {
    const response = await controller.removeFromWatchHistory(
      '33333333-3333-3333-3333-333333333333',
      '11111111-1111-1111-1111-111111111111',
    );
    expect(response.success).toBe(true);
    expect(mockWatchHistoryService.removeFromWatchHistory).toHaveBeenCalledWith(
      '33333333-3333-3333-3333-333333333333',
      '11111111-1111-1111-1111-111111111111',
    );
  });

  it('should clear watch history', async () => {
    const response = await controller.clearWatchHistory('11111111-1111-1111-1111-111111111111');
    expect(response.success).toBe(true);
    expect(response.data?.deletedCount).toBe(5);
    expect(mockWatchHistoryService.clearWatchHistory).toHaveBeenCalledWith(
      '11111111-1111-1111-1111-111111111111',
    );
  });
});
