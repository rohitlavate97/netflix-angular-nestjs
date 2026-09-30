import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SeriesService } from '../services/series.service';
import { CreateSeriesDto } from '../dto/create-series.dto';
import { UpdateSeriesDto } from '../dto/update-series.dto';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { CreateEpisodeDto } from '../dto/create-episode.dto';
import { ContentFilterQueryDto } from '../dto/content-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import {
  ApiResponse,
  SeriesDto,
  SeasonDto,
  EpisodeDto,
  UserRole,
} from '@netflix/shared-types';

@ApiTags('Series')
@Controller('series')
export class SeriesController {
  constructor(private readonly seriesService: SeriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse series catalog with optional filtering' })
  @SwaggerResponse({ status: 200, description: 'List of series' })
  async getSeries(
    @Query() query: ContentFilterQueryDto,
  ): Promise<ApiResponse<SeriesDto[]>> {
    const data = await this.seriesService.findAll(query);
    return {
      success: true,
      data,
      message: 'Series catalog retrieved successfully',
    };
  }

  @Public()
  @Get(':identifier')
  @ApiOperation({ summary: 'Get series details by UUID or URL slug' })
  @ApiParam({ name: 'identifier', description: 'Series UUID or slug' })
  @SwaggerResponse({ status: 200, description: 'Series details' })
  @SwaggerResponse({ status: 404, description: 'Series not found' })
  async getSingleSeries(
    @Param('identifier') identifier: string,
  ): Promise<ApiResponse<SeriesDto>> {
    const data = await this.seriesService.findBySlugOrId(identifier);
    return {
      success: true,
      data,
      message: 'Series retrieved successfully',
    };
  }

  @Public()
  @Get(':id/seasons')
  @ApiOperation({ summary: 'Get all seasons and episodes for a series' })
  @ApiParam({ name: 'id', description: 'Series UUID' })
  @SwaggerResponse({ status: 200, description: 'List of seasons' })
  async getSeasons(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<SeasonDto[]>> {
    const data = await this.seriesService.getSeasons(id);
    return {
      success: true,
      data,
      message: 'Seasons retrieved successfully',
    };
  }

  @Public()
  @Get('seasons/:seasonId/episodes')
  @ApiOperation({ summary: 'Get all episodes for a season' })
  @ApiParam({ name: 'seasonId', description: 'Season UUID' })
  @SwaggerResponse({ status: 200, description: 'List of episodes' })
  async getEpisodes(
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
  ): Promise<ApiResponse<EpisodeDto[]>> {
    const data = await this.seriesService.getEpisodes(seasonId);
    return {
      success: true,
      data,
      message: 'Episodes retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new series record' })
  @SwaggerResponse({ status: 201, description: 'Series created' })
  async createSeries(
    @Body() dto: CreateSeriesDto,
  ): Promise<ApiResponse<SeriesDto>> {
    const data = await this.seriesService.create(dto);
    return {
      success: true,
      data,
      message: 'Series created successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing series record' })
  @ApiParam({ name: 'id', description: 'Series UUID' })
  @SwaggerResponse({ status: 200, description: 'Series updated' })
  async updateSeries(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSeriesDto,
  ): Promise<ApiResponse<SeriesDto>> {
    const data = await this.seriesService.update(id, dto);
    return {
      success: true,
      data,
      message: 'Series updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a series record' })
  @ApiParam({ name: 'id', description: 'Series UUID' })
  @SwaggerResponse({ status: 200, description: 'Series deleted' })
  async deleteSeries(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    await this.seriesService.delete(id);
    return {
      success: true,
      data: { deleted: true },
      message: 'Series deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Post(':id/seasons')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a season to a series' })
  @ApiParam({ name: 'id', description: 'Series UUID' })
  @SwaggerResponse({ status: 201, description: 'Season created' })
  async addSeason(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSeasonDto,
  ): Promise<ApiResponse<SeasonDto>> {
    const data = await this.seriesService.addSeason(id, dto);
    return {
      success: true,
      data,
      message: 'Season added successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Post('seasons/:seasonId/episodes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add an episode to a season' })
  @ApiParam({ name: 'seasonId', description: 'Season UUID' })
  @SwaggerResponse({ status: 201, description: 'Episode created' })
  async addEpisode(
    @Param('seasonId', ParseUUIDPipe) seasonId: string,
    @Body() dto: CreateEpisodeDto,
  ): Promise<ApiResponse<EpisodeDto>> {
    const data = await this.seriesService.addEpisode(seasonId, dto);
    return {
      success: true,
      data,
      message: 'Episode added successfully',
    };
  }
}
