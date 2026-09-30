import { IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SearchEntityType, SearchSortBy } from '@netflix/shared-types';

export class SearchQueryDto {
  @ApiProperty({ example: 'matrix', description: 'Search term for titles, descriptions, cast, and genres' })
  @IsString()
  @MinLength(1)
  q: string;

  @ApiPropertyOptional({ enum: SearchEntityType, default: SearchEntityType.ALL, description: 'Filter by entity type' })
  @IsOptional()
  @IsEnum(SearchEntityType)
  type?: SearchEntityType = SearchEntityType.ALL;

  @ApiPropertyOptional({ example: 'sci-fi', description: 'Filter by genre slug' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ example: '16+', description: 'Filter by maturity rating' })
  @IsOptional()
  @IsString()
  ageRating?: string;

  @ApiPropertyOptional({ enum: SearchSortBy, default: SearchSortBy.RELEVANCE, description: 'Sort criteria' })
  @IsOptional()
  @IsEnum(SearchSortBy)
  sortBy?: SearchSortBy = SearchSortBy.RELEVANCE;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, description: 'Number of items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
