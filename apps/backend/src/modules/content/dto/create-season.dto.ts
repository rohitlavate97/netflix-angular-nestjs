import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSeasonDto {
  @ApiProperty({ example: 1, description: 'Season sequence number' })
  @IsInt()
  @Min(1)
  seasonNumber: number;

  @ApiProperty({ example: 'Season 1', description: 'Season title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ example: 'The disappearance of Will Byers' })
  @IsOptional()
  @IsString()
  description?: string;
}
