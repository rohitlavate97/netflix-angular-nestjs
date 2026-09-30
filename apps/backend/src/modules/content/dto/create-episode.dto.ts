import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEpisodeDto {
  @ApiProperty({ example: 1, description: 'Episode sequence number within season' })
  @IsInt()
  @Min(1)
  episodeNumber: number;

  @ApiProperty({ example: 'Chapter One: The Vanishing of Will Byers' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'On his way home from a friend\'s house, young Will sees something terrifying.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 48, default: 45 })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number = 45;

  @ApiProperty({ example: 'https://assets.streamflix.local/episodes/st-s1-e1.jpg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  thumbnailUrl: string;

  @ApiPropertyOptional({ description: 'MediaAsset UUID for episode HLS stream' })
  @IsOptional()
  @IsUUID('4')
  mediaAssetId?: string;
}
