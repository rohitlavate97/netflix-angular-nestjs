import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Genre } from '../../../database/entities/genre.entity';
import { CreateGenreDto } from '../dto/create-genre.dto';
import { GenreDto } from '@netflix/shared-types';

@Injectable()
export class GenresService {
  private readonly logger = new Logger(GenresService.name);

  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findAll(): Promise<GenreDto[]> {
    const genres = await this.genreRepository.find({
      order: { name: 'ASC' },
    });
    return genres.map((g) => this.toDto(g));
  }

  async findBySlug(slug: string): Promise<GenreDto> {
    const genre = await this.genreRepository.findOne({ where: { slug } });
    if (!genre) {
      throw new NotFoundException(`Genre not found with slug "${slug}"`);
    }
    return this.toDto(genre);
  }

  async create(dto: CreateGenreDto): Promise<GenreDto> {
    const slug = dto.slug || this.slugify(dto.name);
    const existing = await this.genreRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Genre with slug "${slug}" already exists`);
    }

    const genre = this.genreRepository.create({
      name: dto.name,
      slug,
    });

    const saved = await this.genreRepository.save(genre);
    this.logger.log(`Created genre "${saved.name}" (${saved.id})`);
    return this.toDto(saved);
  }

  async delete(id: string): Promise<void> {
    const genre = await this.genreRepository.findOne({ where: { id } });
    if (!genre) {
      throw new NotFoundException(`Genre not found with ID "${id}"`);
    }
    await this.genreRepository.remove(genre);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toDto(genre: Genre): GenreDto {
    return {
      id: genre.id,
      name: genre.name,
      slug: genre.slug,
    };
  }
}
