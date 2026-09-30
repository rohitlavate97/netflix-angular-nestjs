import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Series } from '../../../database/entities/series.entity';
import { Season } from '../../../database/entities/season.entity';
import { Episode } from '../../../database/entities/episode.entity';
import { Genre } from '../../../database/entities/genre.entity';
import { CreateSeriesDto } from '../dto/create-series.dto';
import { UpdateSeriesDto } from '../dto/update-series.dto';
import { CreateSeasonDto } from '../dto/create-season.dto';
import { CreateEpisodeDto } from '../dto/create-episode.dto';
import { ContentFilterQueryDto } from '../dto/content-query.dto';
import {
  SeriesDto,
  SeasonDto,
  EpisodeDto,
  ContentStatus,
} from '@netflix/shared-types';

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(SeriesService.name);

  constructor(
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(Season)
    private readonly seasonRepository: Repository<Season>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async findAll(query?: ContentFilterQueryDto): Promise<SeriesDto[]> {
    const qb = this.seriesRepository
      .createQueryBuilder('series')
      .leftJoinAndSelect('series.genres', 'genre')
      .leftJoinAndSelect('series.seasons', 'season')
      .leftJoinAndSelect('season.episodes', 'episode')
      .leftJoinAndSelect('episode.mediaAsset', 'mediaAsset')
      .orderBy('series.releaseDate', 'DESC')
      .addOrderBy('season.seasonNumber', 'ASC')
      .addOrderBy('episode.episodeNumber', 'ASC');

    if (query?.status) {
      qb.andWhere('series.status = :status', { status: query.status });
    } else {
      qb.andWhere('series.status = :status', { status: ContentStatus.PUBLISHED });
    }

    if (query?.genre) {
      qb.andWhere('genre.slug = :genreSlug', { genreSlug: query.genre });
    }

    if (query?.ageRating) {
      qb.andWhere('series.ageRating = :ageRating', { ageRating: query.ageRating });
    }

    if (query?.search) {
      qb.andWhere(
        '(LOWER(series.title) LIKE :search OR LOWER(series.description) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    const limit = query?.limit ? Number(query.limit) : 20;
    const offset = query?.offset ? Number(query.offset) : 0;
    qb.skip(offset).take(limit);

    const seriesList = await qb.getMany();
    return seriesList.map((s) => this.toDto(s));
  }

  async findBySlugOrId(identifier: string): Promise<SeriesDto> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      identifier,
    );

    const series = await this.seriesRepository.findOne({
      where: isUuid ? { id: identifier } : { slug: identifier },
      relations: [
        'genres',
        'seasons',
        'seasons.episodes',
        'seasons.episodes.mediaAsset',
      ],
      order: {
        seasons: {
          seasonNumber: 'ASC',
          episodes: {
            episodeNumber: 'ASC',
          },
        },
      },
    });

    if (!series) {
      throw new NotFoundException(`Series not found matching "${identifier}"`);
    }

    return this.toDto(series);
  }

  async create(dto: CreateSeriesDto): Promise<SeriesDto> {
    const slug = dto.slug || this.slugify(dto.title);
    const existing = await this.seriesRepository.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`A series with slug "${slug}" already exists`);
    }

    let genres: Genre[] = [];
    if (dto.genreIds && dto.genreIds.length > 0) {
      genres = await this.genreRepository.find({
        where: { id: In(dto.genreIds) },
      });
    }

    const series = this.seriesRepository.create({
      title: dto.title,
      slug,
      description: dto.description,
      releaseDate: new Date(dto.releaseDate),
      ageRating: dto.ageRating || '16+',
      language: dto.language || 'English',
      posterUrl: dto.posterUrl,
      backdropUrl: dto.backdropUrl,
      trailerUrl: dto.trailerUrl,
      status: dto.status || ContentStatus.PUBLISHED,
      genres,
      seasons: [],
    });

    const saved = await this.seriesRepository.save(series);
    this.logger.log(`Created series "${saved.title}" (${saved.id})`);
    return this.findBySlugOrId(saved.id);
  }

  async update(id: string, dto: UpdateSeriesDto): Promise<SeriesDto> {
    const series = await this.seriesRepository.findOne({
      where: { id },
      relations: ['genres'],
    });

    if (!series) {
      throw new NotFoundException(`Series not found with ID "${id}"`);
    }

    if (dto.slug && dto.slug !== series.slug) {
      const conflict = await this.seriesRepository.findOne({ where: { slug: dto.slug } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Series slug "${dto.slug}" already in use`);
      }
      series.slug = dto.slug;
    }

    if (dto.title) series.title = dto.title;
    if (dto.description) series.description = dto.description;
    if (dto.releaseDate) series.releaseDate = new Date(dto.releaseDate);
    if (dto.ageRating) series.ageRating = dto.ageRating;
    if (dto.language) series.language = dto.language;
    if (dto.posterUrl) series.posterUrl = dto.posterUrl;
    if (dto.backdropUrl) series.backdropUrl = dto.backdropUrl;
    if (dto.trailerUrl !== undefined) series.trailerUrl = dto.trailerUrl;
    if (dto.status) series.status = dto.status;

    if (dto.genreIds) {
      series.genres = await this.genreRepository.find({
        where: { id: In(dto.genreIds) },
      });
    }

    await this.seriesRepository.save(series);
    return this.findBySlugOrId(id);
  }

  async delete(id: string): Promise<void> {
    const series = await this.seriesRepository.findOne({ where: { id } });
    if (!series) {
      throw new NotFoundException(`Series not found with ID "${id}"`);
    }
    await this.seriesRepository.remove(series);
    this.logger.log(`Deleted series ID "${id}"`);
  }

  async addSeason(seriesId: string, dto: CreateSeasonDto): Promise<SeasonDto> {
    const series = await this.seriesRepository.findOne({ where: { id: seriesId } });
    if (!series) {
      throw new NotFoundException(`Series not found with ID "${seriesId}"`);
    }

    const existing = await this.seasonRepository.findOne({
      where: { seriesId, seasonNumber: dto.seasonNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Season ${dto.seasonNumber} already exists for series "${series.title}"`,
      );
    }

    const season = this.seasonRepository.create({
      seriesId,
      seasonNumber: dto.seasonNumber,
      title: dto.title,
      description: dto.description,
      episodes: [],
    });

    const saved = await this.seasonRepository.save(season);
    return this.seasonToDto(saved);
  }

  async addEpisode(seasonId: string, dto: CreateEpisodeDto): Promise<EpisodeDto> {
    const season = await this.seasonRepository.findOne({ where: { id: seasonId } });
    if (!season) {
      throw new NotFoundException(`Season not found with ID "${seasonId}"`);
    }

    const existing = await this.episodeRepository.findOne({
      where: { seasonId, episodeNumber: dto.episodeNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Episode ${dto.episodeNumber} already exists for season "${season.title}"`,
      );
    }

    const episode = this.episodeRepository.create({
      seasonId,
      episodeNumber: dto.episodeNumber,
      title: dto.title,
      description: dto.description,
      durationMinutes: dto.durationMinutes || 45,
      thumbnailUrl: dto.thumbnailUrl,
      mediaAssetId: dto.mediaAssetId,
    });

    const saved = await this.episodeRepository.save(episode);
    return this.episodeToDto(saved);
  }

  async getSeasons(seriesId: string): Promise<SeasonDto[]> {
    const seasons = await this.seasonRepository.find({
      where: { seriesId },
      relations: ['episodes', 'episodes.mediaAsset'],
      order: {
        seasonNumber: 'ASC',
        episodes: {
          episodeNumber: 'ASC',
        },
      },
    });
    return seasons.map((s) => this.seasonToDto(s));
  }

  async getEpisodes(seasonId: string): Promise<EpisodeDto[]> {
    const episodes = await this.episodeRepository.find({
      where: { seasonId },
      relations: ['mediaAsset'],
      order: { episodeNumber: 'ASC' },
    });
    return episodes.map((e) => this.episodeToDto(e));
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private toDto(series: Series): SeriesDto {
    return {
      id: series.id,
      title: series.title,
      slug: series.slug,
      description: series.description,
      releaseDate: series.releaseDate instanceof Date
        ? series.releaseDate.toISOString().split('T')[0]
        : String(series.releaseDate),
      ageRating: series.ageRating,
      language: series.language,
      posterUrl: series.posterUrl,
      backdropUrl: series.backdropUrl,
      trailerUrl: series.trailerUrl,
      status: series.status,
      genres: (series.genres || []).map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
      })),
      seasons: (series.seasons || []).map((s) => this.seasonToDto(s)),
    };
  }

  private seasonToDto(season: Season): SeasonDto {
    return {
      id: season.id,
      seriesId: season.seriesId,
      seasonNumber: season.seasonNumber,
      title: season.title,
      description: season.description,
      episodes: (season.episodes || []).map((e) => this.episodeToDto(e)),
    };
  }

  private episodeToDto(episode: Episode): EpisodeDto {
    return {
      id: episode.id,
      seasonId: episode.seasonId,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      description: episode.description,
      durationMinutes: episode.durationMinutes,
      thumbnailUrl: episode.thumbnailUrl,
      mediaAsset: episode.mediaAsset
        ? {
            id: episode.mediaAsset.id,
            masterPlaylistUrl: episode.mediaAsset.masterPlaylistUrl,
            durationSeconds: episode.mediaAsset.durationSeconds,
            resolutions: Array.isArray(episode.mediaAsset.resolutions)
              ? episode.mediaAsset.resolutions
              : [],
            thumbnailUrl: episode.mediaAsset.thumbnailUrl,
            status: episode.mediaAsset.status as 'PROCESSING' | 'READY' | 'FAILED',
          }
        : undefined,
    };
  }
}
