import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SelectProfileDto {
  @ApiPropertyOptional({
    example: '1234',
    description: '4-digit profile security PIN if the profile is locked',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 numeric digits' })
  pin?: string;
}
