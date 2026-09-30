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
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import {
  ApiResponse,
  CategoryDto,
  ContentCategoryRowDto,
  UserRole,
} from '@netflix/shared-types';

@ApiTags('Categories & Home Feed')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get list of active homepage categories' })
  @SwaggerResponse({ status: 200, description: 'List of categories' })
  async getCategories(): Promise<ApiResponse<CategoryDto[]>> {
    const data = await this.categoriesService.findAll();
    return {
      success: true,
      data,
      message: 'Categories retrieved successfully',
    };
  }

  @Public()
  @Get('feed')
  @ApiOperation({ summary: 'Get full homepage feed with populated content rows' })
  @SwaggerResponse({ status: 200, description: 'Homepage feed with category rows' })
  async getHomeFeed(): Promise<ApiResponse<ContentCategoryRowDto[]>> {
    const data = await this.categoriesService.getHomeFeed();
    return {
      success: true,
      data,
      message: 'Homepage content feed retrieved successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new content category row' })
  @SwaggerResponse({ status: 201, description: 'Category created' })
  async createCategory(
    @Body() dto: CreateCategoryDto,
  ): Promise<ApiResponse<CategoryDto>> {
    const data = await this.categoriesService.create(dto);
    return {
      success: true,
      data,
      message: 'Category created successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CONTENT_MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @SwaggerResponse({ status: 200, description: 'Category deleted' })
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    await this.categoriesService.delete(id);
    return {
      success: true,
      data: { deleted: true },
      message: 'Category deleted successfully',
    };
  }
}
