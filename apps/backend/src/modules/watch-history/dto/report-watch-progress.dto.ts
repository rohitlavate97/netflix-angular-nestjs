import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';
import { ReportWatchProgressDto as IReportWatchProgressDto } from '@netflix/shared-types';

export class ReportWatchProgressDto implements IReportWatchProgressDto {
  @ApiProperty({ description: 'Active profile UUID' })
  @IsUUID()
  profileId: string;

  @ApiPropertyOptional({ description: 'Movie UUID (for movie progress)' })
  @IsOptional()
  @IsUUID()
  movieId?: string;

  @ApiPropertyOptional({ description: 'Episode UUID (for series progress)' })
  @IsOptional()
  @IsUUID()
  episodeId?: string;

  @ApiProperty({ description: 'Current playback position in seconds', example: 120 })
  @IsInt()
  @Min(0)
  positionSeconds: number;

  @ApiProperty({ description: 'Total duration in seconds', example: 7200 })
  @IsInt()
  @Min(0)
  durationSeconds: number;

  @ApiPropertyOptional({ description: 'Explicit completion flag', default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
