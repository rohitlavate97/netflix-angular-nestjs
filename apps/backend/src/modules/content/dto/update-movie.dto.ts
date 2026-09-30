import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@netflix/shared-types';

export class UpdateMovieDto {
  @ApiPropertyOptional({ example: 'Inception (Remastered)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'inception-remastered' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 'Updated plot description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2010-07-16' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: '16+' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  ageRating?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  language?: string;

  @ApiPropertyOptional({ example: 'USA' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({ example: 'https://assets.streamflix.local/posters/inception.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  posterUrl?: string;

  @ApiPropertyOptional({ example: 'https://assets.streamflix.local/backdrops/inception.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  backdropUrl?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=YoHD9XEInc0' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  trailerUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cast?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  mediaAssetId?: string;

  @ApiPropertyOptional({ enum: ContentStatus })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
