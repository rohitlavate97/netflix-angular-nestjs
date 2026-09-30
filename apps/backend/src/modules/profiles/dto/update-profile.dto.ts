import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MaturityRating } from '@netflix/shared-types';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex Updated', description: 'Updated display name' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Profile name must be at least 1 character' })
  @MaxLength(50, { message: 'Profile name cannot exceed 50 characters' })
  name?: string;

  @ApiPropertyOptional({
    example: 'https://assets.streamflix.local/avatars/netflix-avatar-blue.png',
    description: 'Updated avatar image URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ example: false, description: 'Toggle Kids mode' })
  @IsOptional()
  @IsBoolean()
  isKids?: boolean;

  @ApiPropertyOptional({
    example: '16+',
    enum: ['ALL', '7+', '13+', '16+', '18+'],
    description: 'Updated maximum maturity rating',
  })
  @IsOptional()
  @IsEnum(['ALL', '7+', '13+', '16+', '18+'], {
    message: 'Maturity rating must be one of: ALL, 7+, 13+, 16+, 18+',
  })
  maturityRating?: MaturityRating;

  @ApiPropertyOptional({ example: 'es', description: 'Updated language code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({
    example: '5678',
    description: '4-digit lock PIN, or empty string/null to remove existing PIN',
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 numeric digits or empty to remove' })
  pin?: string | null;

  @ApiPropertyOptional({ example: false, description: 'Updated autoplay preference' })
  @IsOptional()
  @IsBoolean()
  autoplayNext?: boolean;
}
