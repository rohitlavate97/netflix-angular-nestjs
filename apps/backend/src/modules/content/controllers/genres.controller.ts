import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
import { GenresService } from '../services/genres.service';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import { ApiResponse, GenreDto, UserRole } from '@netflix/shared-types';

@ApiTags('Genres')
@Controller('genres')
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get list of all content genres' })
  @SwaggerResponse({ status: 200, description: 'List of genres' })
  async getGenres(): Promise<ApiResponse<GenreDto[]>> {
    const data = await this.genresService.findAll();
    return {
      success: true,
      data,
      message: 'Genres retrieved successfully',
    };
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get genre by slug' })
  @ApiParam({ name: 'slug', description: 'Genre slug (e.g. sci-fi)' })
  @SwaggerResponse({ status: 200, description: 'Genre details' })
  async getGenreBySlug(
    @Param('slug') slug: string,
  ): Promise<ApiResponse<GenreDto>> {
    const data = await this.genresService.findBySlug(slug);
    return {
      success: true,
      data,
      message: 'Genre retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new genre' })
  @SwaggerResponse({ status: 201, description: 'Genre created' })
  async createGenre(
    @Body() dto: CreateGenreDto,
  ): Promise<ApiResponse<GenreDto>> {
    const data = await this.genresService.create(dto);
    return {
      success: true,
      data,
      message: 'Genre created successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a genre' })
  @ApiParam({ name: 'id', description: 'Genre UUID' })
  @SwaggerResponse({ status: 200, description: 'Genre deleted' })
  async deleteGenre(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    await this.genresService.delete(id);
    return {
      success: true,
      data: { deleted: true },
      message: 'Genre deleted successfully',
    };
  }
}
