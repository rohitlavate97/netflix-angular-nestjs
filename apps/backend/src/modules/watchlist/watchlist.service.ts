import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from '../../database/entities/watchlist.entity';
import { Movie } from '../../database/entities/movie.entity';
import { Series } from '../../database/entities/series.entity';
import { Profile } from '../../database/entities/profile.entity';
import { AddToWatchlistDto } from './dto/add-to-watchlist.dto';
import { WatchlistQueryDto } from './dto/watchlist-query.dto';
import {
  WatchlistItemDto,
  WatchlistResponseDto,
  WatchlistCheckResponseDto,
} from '@netflix/shared-types';

@Injectable()
export class WatchlistService {
  private readonly logger = new Logger(WatchlistService.name);

  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepository: Repository<Watchlist>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getWatchlist(query: WatchlistQueryDto): Promise<WatchlistResponseDto> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;

    const qb = this.watchlistRepository
      .createQueryBuilder('watchlist')
      .leftJoinAndSelect('watchlist.movie', 'movie')
      .leftJoinAndSelect('movie.genres', 'movieGenre')
      .leftJoinAndSelect('watchlist.series', 'series')
      .leftJoinAndSelect('series.genres', 'seriesGenre')
      .where('watchlist.profileId = :profileId', { profileId: query.profileId })
      .orderBy('watchlist.createdAt', 'DESC');

    if (query.type === 'movie') {
      qb.andWhere('watchlist.movieId IS NOT NULL');
    } else if (query.type === 'series') {
      qb.andWhere('watchlist.seriesId IS NOT NULL');
    }

    const [entities, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const items: WatchlistItemDto[] = entities.map((item) => this.mapToDto(item));

    return {
      items,
      total,
    };
  }

  async addToWatchlist(dto: AddToWatchlistDto): Promise<WatchlistItemDto> {
    const profile = await this.profileRepository.findOne({
      where: { id: dto.profileId },
    });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${dto.profileId} not found`);
    }

    if (dto.contentType === 'movie') {
      const movie = await this.movieRepository.findOne({
        where: { id: dto.contentId },
        relations: ['genres'],
      });
      if (!movie) {
        throw new NotFoundException(`Movie with ID ${dto.contentId} not found`);
      }

      const existing = await this.watchlistRepository.findOne({
        where: { profileId: dto.profileId, movieId: dto.contentId },
        relations: ['movie', 'movie.genres'],
      });
      if (existing) {
        return this.mapToDto(existing);
      }

      const watchlistItem = this.watchlistRepository.create({
        profileId: dto.profileId,
        movieId: dto.contentId,
      });

      const saved = await this.watchlistRepository.save(watchlistItem);
      saved.movie = movie;
      return this.mapToDto(saved);
    } else {
      const series = await this.seriesRepository.findOne({
        where: { id: dto.contentId },
        relations: ['genres', 'seasons'],
      });
      if (!series) {
        throw new NotFoundException(`Series with ID ${dto.contentId} not found`);
      }

      const existing = await this.watchlistRepository.findOne({
        where: { profileId: dto.profileId, seriesId: dto.contentId },
        relations: ['series', 'series.genres'],
      });
      if (existing) {
        return this.mapToDto(existing);
      }

      const watchlistItem = this.watchlistRepository.create({
        profileId: dto.profileId,
        seriesId: dto.contentId,
      });

      const saved = await this.watchlistRepository.save(watchlistItem);
      saved.series = series;
      return this.mapToDto(saved);
    }
  }

  async removeFromWatchlist(
    profileId: string,
    contentId: string,
  ): Promise<{ success: boolean; message: string }> {
    const item = await this.watchlistRepository
      .createQueryBuilder('watchlist')
      .where('watchlist.profileId = :profileId', { profileId })
      .andWhere(
        '(watchlist.movieId = :contentId OR watchlist.seriesId = :contentId OR watchlist.id = :contentId)',
        { contentId },
      )
      .getOne();

    if (!item) {
      throw new NotFoundException(
        `Watchlist entry for content ${contentId} on profile ${profileId} not found`,
      );
    }

    await this.watchlistRepository.remove(item);
    return { success: true, message: 'Item successfully removed from watchlist' };
  }

  async checkInWatchlist(
    profileId: string,
    contentId: string,
  ): Promise<WatchlistCheckResponseDto> {
    const item = await this.watchlistRepository
      .createQueryBuilder('watchlist')
      .where('watchlist.profileId = :profileId', { profileId })
      .andWhere(
        '(watchlist.movieId = :contentId OR watchlist.seriesId = :contentId)',
        { contentId },
      )
      .getOne();

    return {
      inWatchlist: !!item,
      watchlistItemId: item?.id,
    };
  }

  private mapToDto(item: Watchlist): WatchlistItemDto {
    return {
      id: item.id,
      profileId: item.profileId,
      movieId: item.movieId,
      seriesId: item.seriesId,
      createdAt:
        item.createdAt instanceof Date
          ? item.createdAt.toISOString()
          : String(item.createdAt),
      movie: item.movie
        ? {
            id: item.movie.id,
            title: item.movie.title,
            slug: item.movie.slug,
            description: item.movie.description,
            releaseDate:
              item.movie.releaseDate instanceof Date
                ? item.movie.releaseDate.toISOString()
                : String(item.movie.releaseDate),
            durationMinutes: item.movie.durationMinutes,
            ageRating: item.movie.ageRating,
            language: item.movie.language,
            country: item.movie.country,
            posterUrl: item.movie.posterUrl,
            backdropUrl: item.movie.backdropUrl,
            status: item.movie.status,
            viewCount: item.movie.viewCount,
            averageRating: Number(item.movie.averageRating) || 0,
            genres: item.movie.genres
              ? item.movie.genres.map((g) => ({
                  id: g.id,
                  name: g.name,
                  slug: g.slug,
                }))
              : [],
          }
        : undefined,
      series: item.series
        ? {
            id: item.series.id,
            title: item.series.title,
            slug: item.series.slug,
            description: item.series.description,
            releaseDate:
              item.series.releaseDate instanceof Date
                ? item.series.releaseDate.toISOString()
                : String(item.series.releaseDate),
            ageRating: item.series.ageRating,
            language: item.series.language,
            posterUrl: item.series.posterUrl,
            backdropUrl: item.series.backdropUrl,
            status: item.series.status,
            genres: item.series.genres
              ? item.series.genres.map((g) => ({
                  id: g.id,
                  name: g.name,
                  slug: g.slug,
                }))
              : [],
            seasons: [],
          }
        : undefined,
    };
  }
}
