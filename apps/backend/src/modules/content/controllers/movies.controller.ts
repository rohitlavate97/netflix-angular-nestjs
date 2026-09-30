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
import { MoviesService } from '../services/movies.service';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { ContentFilterQueryDto } from '../dto/content-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { ApiResponse, MovieDto, UserRole } from '@netflix/shared-types';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse movies catalog with optional filtering' })
  @SwaggerResponse({ status: 200, description: 'List of movies' })
  async getMovies(
    @Query() query: ContentFilterQueryDto,
  ): Promise<ApiResponse<MovieDto[]>> {
    const data = await this.moviesService.findAll(query);
    return {
      success: true,
      data,
      message: 'Movies catalog retrieved successfully',
    };
  }

  @Public()
  @Get(':identifier')
  @ApiOperation({ summary: 'Get movie details by UUID or URL slug' })
  @ApiParam({ name: 'identifier', description: 'Movie UUID or slug' })
  @SwaggerResponse({ status: 200, description: 'Movie details' })
  @SwaggerResponse({ status: 404, description: 'Movie not found' })
  async getMovie(
    @Param('identifier') identifier: string,
  ): Promise<ApiResponse<MovieDto>> {
    const data = await this.moviesService.findBySlugOrId(identifier);
    return {
      success: true,
      data,
      message: 'Movie retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new movie record' })
  @SwaggerResponse({ status: 201, description: 'Movie created' })
  @SwaggerResponse({ status: 403, description: 'Forbidden: Insufficient privileges' })
  async createMovie(
    @Body() dto: CreateMovieDto,
  ): Promise<ApiResponse<MovieDto>> {
    const data = await this.moviesService.create(dto);
    return {
      success: true,
      data,
      message: 'Movie created successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing movie record' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @SwaggerResponse({ status: 200, description: 'Movie updated' })
  async updateMovie(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMovieDto,
  ): Promise<ApiResponse<MovieDto>> {
    const data = await this.moviesService.update(id, dto);
    return {
      success: true,
      data,
      message: 'Movie updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a movie record' })
  @ApiParam({ name: 'id', description: 'Movie UUID' })
  @SwaggerResponse({ status: 200, description: 'Movie deleted' })
  async deleteMovie(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    await this.moviesService.delete(id);
    return {
      success: true,
      data: { deleted: true },
      message: 'Movie deleted successfully',
    };
  }
}
