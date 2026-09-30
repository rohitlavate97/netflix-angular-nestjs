import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../../database/entities/category.entity';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { MoviesService } from './movies.service';
import { SeriesService } from './series.service';
import { CategoryDto, ContentCategoryRowDto } from '@netflix/shared-types';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly moviesService: MoviesService,
    private readonly seriesService: SeriesService,
  ) {}

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
    return categories.map((c) => this.toDto(c));
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      slug,
      displayOrder: dto.displayOrder || 0,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
    });

    const saved = await this.categoryRepository.save(category);
    this.logger.log(`Created category "${saved.name}" (${saved.id})`);
    return this.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category not found with ID "${id}"`);
    }
    await this.categoryRepository.remove(category);
  }

  async getHomeFeed(): Promise<ContentCategoryRowDto[]> {
    const categories = await this.findAll();
    const rows: ContentCategoryRowDto[] = [];

    for (const category of categories) {
      // Map category slug to catalog queries
      const genreSlug = ['action', 'comedy', 'sci-fi', 'drama', 'horror'].includes(category.slug)
        ? category.slug
        : undefined;

      const movies = await this.moviesService.findAll({
        genre: genreSlug,
        limit: 10,
      });

      const series = await this.seriesService.findAll({
        genre: genreSlug,
        limit: 10,
      });

      rows.push({
        category,
        movies,
        series,
      });
    }

    return rows;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toDto(category: Category): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    };
  }
}
