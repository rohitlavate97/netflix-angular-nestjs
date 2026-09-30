import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@netflix/shared-types';

export class ContentFilterQueryDto {
  @ApiPropertyOptional({ example: 'sci-fi', description: 'Filter by genre slug' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ example: '16+', description: 'Filter by maturity rating' })
  @IsOptional()
  @IsString()
  ageRating?: string;

  @ApiPropertyOptional({ enum: ContentStatus, example: ContentStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ example: 'Interstellar', description: 'Search title or description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
