import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaturityRating } from '@netflix/shared-types';

export class CreateProfileDto {
  @ApiProperty({ example: 'Alex', description: 'Display name for the profile' })
  @IsString()
  @IsNotEmpty({ message: 'Profile name is required' })
  @MinLength(1, { message: 'Profile name must be at least 1 character' })
  @MaxLength(50, { message: 'Profile name cannot exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'https://assets.streamflix.local/avatars/netflix-avatar-red.png',
    description: 'Avatar image URL',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatarUrl?: string;

  @ApiPropertyOptional({ example: false, description: 'Whether this profile is in Kids mode' })
  @IsOptional()
  @IsBoolean()
  isKids?: boolean;

  @ApiPropertyOptional({
    example: '18+',
    enum: ['ALL', '7+', '13+', '16+', '18+'],
    description: 'Maximum content maturity rating allowed for this profile',
  })
  @IsOptional()
  @IsEnum(['ALL', '7+', '13+', '16+', '18+'], {
    message: 'Maturity rating must be one of: ALL, 7+, 13+, 16+, 18+',
  })
  maturityRating?: MaturityRating;

  @ApiPropertyOptional({ example: 'en', description: 'Preferred language code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Optional 4-digit lock PIN for this profile',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 numeric digits' })
  pin?: string;

  @ApiPropertyOptional({ example: true, description: 'Autoplay next episode preference' })
  @IsOptional()
  @IsBoolean()
  autoplayNext?: boolean;
}
