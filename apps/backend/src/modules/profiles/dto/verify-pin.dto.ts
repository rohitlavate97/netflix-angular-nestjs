import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPinDto {
  @ApiProperty({ example: '1234', description: '4-digit profile security PIN' })
  @IsString()
  @IsNotEmpty({ message: 'PIN is required' })
  @Matches(/^\d{4}$/, { message: 'PIN must be exactly 4 numeric digits' })
  pin: string;
}
