import { Test, TestingModule } from '@nestjs/testing';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';
import { WatchlistQueryDto } from './dto/watchlist-query.dto';

describe('WatchlistController', () => {
  let controller: WatchlistController;
  let watchlistService: {
    getWatchlist: jest.Mock;
    addToWatchlist: jest.Mock;
    removeFromWatchlist: jest.Mock;
    checkInWatchlist: jest.Mock;
  };

  const mockWatchlistItem = {
    id: 'w-1',
    profileId: 'p-1',
    movieId: 'm-1',
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    watchlistService = {
      getWatchlist: jest.fn().mockResolvedValue({ items: [mockWatchlistItem], total: 1 }),
      addToWatchlist: jest.fn().mockResolvedValue(mockWatchlistItem),
      removeFromWatchlist: jest.fn().mockResolvedValue({ success: true, message: 'Removed' }),
      checkInWatchlist: jest.fn().mockResolvedValue({ inWatchlist: true, watchlistItemId: 'w-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WatchlistController],
      providers: [
        {
          provide: WatchlistService,
          useValue: watchlistService,
        },
      ],
    }).compile();

    controller = module.get<WatchlistController>(WatchlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get watchlist for profile', async () => {
    const query: WatchlistQueryDto = { profileId: 'p-1', type: 'all', page: 1, limit: 20 };
    const res = await controller.getWatchlist(query);
    expect(watchlistService.getWatchlist).toHaveBeenCalledWith(query);
    expect(res.items.length).toBe(1);
  });

  it('should add item to watchlist', async () => {
    const dto: AddToWatchlistDto = {
      profileId: 'p-1',
      contentId: 'm-1',
      contentType: 'movie',
    };
    const res = await controller.addToWatchlist(dto);
    expect(watchlistService.addToWatchlist).toHaveBeenCalledWith(dto);
    expect(res.id).toBe('w-1');
  });

  it('should remove item from watchlist', async () => {
    const res = await controller.removeFromWatchlist('p-1', 'm-1');
    expect(watchlistService.removeFromWatchlist).toHaveBeenCalledWith('p-1', 'm-1');
    expect(res.success).toBe(true);
  });

  it('should check if item is in watchlist', async () => {
    const res = await controller.checkInWatchlist('p-1', 'm-1');
    expect(watchlistService.checkInWatchlist).toHaveBeenCalledWith('p-1', 'm-1');
    expect(res.inWatchlist).toBe(true);
  });
});
