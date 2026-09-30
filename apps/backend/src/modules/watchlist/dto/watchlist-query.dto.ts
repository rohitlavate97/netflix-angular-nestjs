import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WatchlistQueryDto {
  @ApiProperty({ description: 'Profile ID whose watchlist is requested', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  profileId: string;

  @ApiPropertyOptional({ enum: ['all', 'movie', 'series'], default: 'all', description: 'Filter by content type' })
  @IsOptional()
  @IsEnum(['all', 'movie', 'series'])
  type?: 'all' | 'movie' | 'series' = 'all';

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
