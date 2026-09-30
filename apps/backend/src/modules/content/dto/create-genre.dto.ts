import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGenreDto {
  @ApiProperty({ example: 'Sci-Fi', description: 'Genre name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'sci-fi', description: 'Unique genre slug' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string;
}
