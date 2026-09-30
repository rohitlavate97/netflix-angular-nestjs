import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@netflix/shared-types';

export class CreateSeriesDto {
  @ApiProperty({ example: 'Stranger Things', description: 'Series title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'stranger-things', description: 'Unique URL slug' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({ example: 'When a young boy vanishes, a small town uncovers a mystery...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2016-07-15' })
  @IsDateString()
  releaseDate: string;

  @ApiPropertyOptional({ example: '16+', default: '16+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ageRating?: string;

  @ApiPropertyOptional({ example: 'English', default: 'English' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;

  @ApiProperty({ example: 'https://assets.streamflix.local/posters/stranger-things.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  posterUrl: string;

  @ApiProperty({ example: 'https://assets.streamflix.local/backdrops/stranger-things.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  backdropUrl: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=b9EkMc79ZSU' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  trailerUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ['Millie Bobby Brown', 'David Harbour'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cast?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Genre UUIDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
