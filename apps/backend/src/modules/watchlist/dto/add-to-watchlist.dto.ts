import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WatchlistContentType } from '@netflix/shared-types';

export class AddToWatchlistDto {
  @ApiProperty({ description: 'Target profile ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  profileId: string;

  @ApiProperty({ description: 'Target movie or series content ID', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  contentId: string;

  @ApiProperty({ description: 'Type of content', enum: ['movie', 'series'], example: 'movie' })
  @IsEnum(['movie', 'series'])
  contentType: WatchlistContentType;
}
