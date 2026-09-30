import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { WatchHistoryService } from './watch-history.service';
import { ReportWatchProgressDto } from './dto/report-watch-progress.dto';
import { WatchHistoryQueryDto } from './dto/watch-history-query.dto';

@ApiTags('Watch History')
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Post('progress')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Report or update playback progress for a profile' })
  @ApiResponse({ status: 200, description: 'Playback progress successfully recorded' })
  @ApiResponse({ status: 400, description: 'Invalid payload or missing content identifier' })
  @ApiResponse({ status: 404, description: 'Profile or content not found' })
  async reportProgress(@Body() dto: ReportWatchProgressDto) {
    const record = await this.watchHistoryService.reportProgress(dto);
    return {
      success: true,
      message: 'Playback progress recorded successfully',
      data: record,
    };
  }

  @Get('continue-watching')
  @ApiOperation({ summary: 'Retrieve continue watching queue for a profile' })
  @ApiQuery({ name: 'profileId', required: true, description: 'UUID of the profile' })
  @ApiResponse({ status: 200, description: 'List of continue-watching items' })
  async getContinueWatching(@Query('profileId', ParseUUIDPipe) profileId: string) {
    const data = await this.watchHistoryService.getContinueWatching(profileId);
    return {
      success: true,
      data,
    };
  }

  @Get('resume')
  @ApiOperation({ summary: 'Get resume playback position for a movie or episode' })
  @ApiQuery({ name: 'profileId', required: true, description: 'UUID of the profile' })
  @ApiQuery({ name: 'movieId', required: false, description: 'Movie UUID' })
  @ApiQuery({ name: 'episodeId', required: false, description: 'Episode UUID' })
  @ApiResponse({ status: 200, description: 'Resume playback timestamp and metadata' })
  async getResumePlayback(
    @Query('profileId', ParseUUIDPipe) profileId: string,
    @Query('movieId') movieId?: string,
    @Query('episodeId') episodeId?: string,
  ) {
    const data = await this.watchHistoryService.getResumePlayback(
      profileId,
      movieId,
      episodeId,
    );
    return {
      success: true,
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve paginated watch history for a profile' })
  @ApiResponse({ status: 200, description: 'Paginated watch history' })
  async getWatchHistory(@Query() query: WatchHistoryQueryDto) {
    const data = await this.watchHistoryService.getWatchHistory(query);
    return {
      success: true,
      data,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an item from watch history' })
  @ApiQuery({ name: 'profileId', required: true, description: 'UUID of the profile' })
  @ApiResponse({ status: 200, description: 'Item removed from watch history' })
  @ApiResponse({ status: 404, description: 'Item not found' })
  async removeFromWatchHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('profileId', ParseUUIDPipe) profileId: string,
  ) {
    const result = await this.watchHistoryService.removeFromWatchHistory(id, profileId);
    return {
      success: true,
      message: result.message,
    };
  }

  @Delete('profile/:profileId')
  @ApiOperation({ summary: 'Clear all viewing history for a profile' })
  @ApiResponse({ status: 200, description: 'Watch history cleared' })
  async clearWatchHistory(@Param('profileId', ParseUUIDPipe) profileId: string) {
    const result = await this.watchHistoryService.clearWatchHistory(profileId);
    return {
      success: true,
      message: result.message,
      data: { deletedCount: result.deletedCount },
    };
  }
}
