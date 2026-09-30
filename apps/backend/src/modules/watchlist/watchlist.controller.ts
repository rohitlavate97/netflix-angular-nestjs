import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';
import { WatchlistQueryDto } from './dto/watchlist-query.dto';
import {
  WatchlistItemDto,
  WatchlistResponseDto,
  WatchlistCheckResponseDto,
} from '@netflix/shared-types';

@ApiTags('Watchlist')
@Controller('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({
    summary: 'Get profile watchlist',
    description: 'Retrieve paginated watchlist items for a specific profile with optional content type filtering.',
  })
  @ApiResponse({ status: 200, description: 'Watchlist items returned successfully' })
  async getWatchlist(@Query() query: WatchlistQueryDto): Promise<WatchlistResponseDto> {
    return this.watchlistService.getWatchlist(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add content to watchlist',
    description: 'Add a movie or TV series to a profile watchlist with duplicate prevention.',
  })
  @ApiResponse({ status: 201, description: 'Content successfully added to watchlist' })
  @ApiResponse({ status: 404, description: 'Profile or content not found' })
  async addToWatchlist(@Body() dto: AddToWatchlistDto): Promise<WatchlistItemDto> {
    return this.watchlistService.addToWatchlist(dto);
  }

  @Delete(':profileId/:contentId')
  @ApiOperation({
    summary: 'Remove content from watchlist',
    description: 'Remove a title from a profile watchlist by content ID or entry ID.',
  })
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  @ApiParam({ name: 'contentId', description: 'Content ID or Watchlist Entry UUID' })
  @ApiResponse({ status: 200, description: 'Item removed from watchlist successfully' })
  @ApiResponse({ status: 404, description: 'Watchlist entry not found' })
  async removeFromWatchlist(
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Param('contentId', ParseUUIDPipe) contentId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.watchlistService.removeFromWatchlist(profileId, contentId);
  }

  @Get('check')
  @ApiOperation({
    summary: 'Check if title is in watchlist',
    description: 'Quick check if a movie or series is saved in the active profile watchlist.',
  })
  @ApiQuery({ name: 'profileId', description: 'Profile UUID' })
  @ApiQuery({ name: 'contentId', description: 'Content UUID' })
  @ApiResponse({ status: 200, description: 'Check status returned' })
  async checkInWatchlist(
    @Query('profileId', ParseUUIDPipe) profileId: string,
    @Query('contentId', ParseUUIDPipe) contentId: string,
  ): Promise<WatchlistCheckResponseDto> {
    return this.watchlistService.checkInWatchlist(profileId, contentId);
  }
}
