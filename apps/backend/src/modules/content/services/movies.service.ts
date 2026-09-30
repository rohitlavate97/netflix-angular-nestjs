import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Movie } from '../../../database/entities/movie.entity';
import { Genre } from '../../../database/entities/genre.entity';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { ContentFilterQueryDto } from '../dto/content-query.dto';
import { MovieDto, ContentStatus } from '@netflix/shared-types';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findAll(query?: ContentFilterQueryDto): Promise<MovieDto[]> {
    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.genres', 'genre')
      .leftJoinAndSelect('movie.mediaAsset', 'mediaAsset')
      .orderBy('movie.releaseDate', 'DESC')
      .addOrderBy('movie.viewCount', 'DESC');

    if (query?.status) {
      qb.andWhere('movie.status = :status', { status: query.status });
    } else {
      qb.andWhere('movie.status = :status', { status: ContentStatus.PUBLISHED });
    }

    if (query?.genre) {
      qb.andWhere('genre.slug = :genreSlug', { genreSlug: query.genre });
    }

    if (query?.ageRating) {
      qb.andWhere('movie.ageRating = :ageRating', { ageRating: query.ageRating });
    }

    if (query?.search) {
      qb.andWhere(
        '(LOWER(movie.title) LIKE :search OR LOWER(movie.description) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    const limit = query?.limit ? Number(query.limit) : 20;
    const offset = query?.offset ? Number(query.offset) : 0;
    qb.skip(offset).take(limit);

    const movies = await qb.getMany();
    return movies.map((m) => this.toDto(m));
  }

  async findBySlugOrId(identifier: string): Promise<MovieDto> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      identifier,
    );

    const movie = await this.movieRepository.findOne({
      where: isUuid ? { id: identifier } : { slug: identifier },
      relations: ['genres', 'mediaAsset'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie not found matching "${identifier}"`);
    }

    return this.toDto(movie);
  }

  async create(dto: CreateMovieDto): Promise<MovieDto> {
    const slug = dto.slug || this.slugify(dto.title);
    const existing = await this.movieRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`A movie with slug "${slug}" already exists`);
    }

    let genres: Genre[] = [];
    if (dto.genreIds && dto.genreIds.length > 0) {
      genres = await this.genreRepository.find({
        where: { id: In(dto.genreIds) },
      });
    }

    const movie = this.movieRepository.create({
      title: dto.title,
      slug,
      description: dto.description,
      releaseDate: new Date(dto.releaseDate),
      durationMinutes: dto.durationMinutes,
      ageRating: dto.ageRating || '16+',
      language: dto.language || 'English',
      country: dto.country || 'USA',
      posterUrl: dto.posterUrl,
      backdropUrl: dto.backdropUrl,
      trailerUrl: dto.trailerUrl,
      status: dto.status || ContentStatus.PUBLISHED,
      mediaAssetId: dto.mediaAssetId,
      genres,
    });

    const saved = await this.movieRepository.save(movie);
    this.logger.log(`Created movie "${saved.title}" (${saved.id})`);
    return this.findBySlugOrId(saved.id);
  }

  async update(id: string, dto: UpdateMovieDto): Promise<MovieDto> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['genres'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie not found with ID "${id}"`);
    }

    if (dto.slug && dto.slug !== movie.slug) {
      const conflict = await this.movieRepository.findOne({ where: { slug: dto.slug } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Movie slug "${dto.slug}" already in use`);
      }
      movie.slug = dto.slug;
    }

    if (dto.title) movie.title = dto.title;
    if (dto.description) movie.description = dto.description;
    if (dto.releaseDate) movie.releaseDate = new Date(dto.releaseDate);
    if (dto.durationMinutes) movie.durationMinutes = dto.durationMinutes;
    if (dto.ageRating) movie.ageRating = dto.ageRating;
    if (dto.language) movie.language = dto.language;
    if (dto.country) movie.country = dto.country;
    if (dto.posterUrl) movie.posterUrl = dto.posterUrl;
    if (dto.backdropUrl) movie.backdropUrl = dto.backdropUrl;
    if (dto.trailerUrl !== undefined) movie.trailerUrl = dto.trailerUrl;
    if (dto.mediaAssetId !== undefined) movie.mediaAssetId = dto.mediaAssetId;
    if (dto.status) movie.status = dto.status;

    if (dto.genreIds) {
      movie.genres = await this.genreRepository.find({
        where: { id: In(dto.genreIds) },
      });
    }

    await this.movieRepository.save(movie);
    return this.findBySlugOrId(id);
  }

  async delete(id: string): Promise<void> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie not found with ID "${id}"`);
    }
    await this.movieRepository.remove(movie);
    this.logger.log(`Deleted movie ID "${id}"`);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.movieRepository.increment({ id }, 'viewCount', 1);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toDto(movie: Movie): MovieDto {
    return {
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      description: movie.description,
      releaseDate: movie.releaseDate instanceof Date
        ? movie.releaseDate.toISOString().split('T')[0]
        : String(movie.releaseDate),
      durationMinutes: movie.durationMinutes,
      ageRating: movie.ageRating,
      language: movie.language,
      country: movie.country,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      trailerUrl: movie.trailerUrl,
      status: movie.status,
      viewCount: movie.viewCount,
      averageRating: Number(movie.averageRating) || 0,
      genres: (movie.genres || []).map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
      })),
      mediaAsset: movie.mediaAsset
        ? {
            id: movie.mediaAsset.id,
            masterPlaylistUrl: movie.mediaAsset.masterPlaylistUrl,
            durationSeconds: movie.mediaAsset.durationSeconds,
            resolutions: Array.isArray(movie.mediaAsset.resolutions)
              ? movie.mediaAsset.resolutions
              : [],
            thumbnailUrl: movie.mediaAsset.thumbnailUrl,
            status: movie.mediaAsset.status as 'PROCESSING' | 'READY' | 'FAILED',
          }
        : undefined,
    };
  }
}
