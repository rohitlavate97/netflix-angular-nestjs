import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@netflix/shared-types';

export class CreateMovieDto {
  @ApiProperty({ example: 'Inception', description: 'Movie title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'inception-2010', description: 'Unique URL slug' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({ example: 'A thief who steals corporate secrets...', description: 'Movie plot summary' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2010-07-16', description: 'Release date (YYYY-MM-DD)' })
  @IsDateString()
  releaseDate: string;

  @ApiProperty({ example: 148, description: 'Duration in minutes' })
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @ApiPropertyOptional({ example: '13+', default: '16+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ageRating?: string;

  @ApiPropertyOptional({ example: 'English', default: 'English' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;

  @ApiPropertyOptional({ example: 'USA', default: 'USA' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiProperty({ example: 'https://assets.streamflix.local/posters/inception.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  posterUrl: string;

  @ApiProperty({ example: 'https://assets.streamflix.local/backdrops/inception.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  backdropUrl: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=YoHD9XEInc0' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  trailerUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cast?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Genre UUIDs' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];

  @ApiPropertyOptional({ description: 'MediaAsset UUID for video streaming' })
  @IsOptional()
  @IsUUID('4')
  mediaAssetId?: string;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.PUBLISHED })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
