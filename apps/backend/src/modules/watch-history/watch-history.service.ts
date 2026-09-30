import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WatchHistory } from '../../database/entities/watch-history.entity';
import { Profile } from '../../database/entities/profile.entity';
import { Movie } from '../../database/entities/movie.entity';
import { Episode } from '../../database/entities/episode.entity';
import { RedisService } from '../redis/redis.service';
import { ReportWatchProgressDto } from './dto/report-watch-progress.dto';
import { WatchHistoryQueryDto } from './dto/watch-history-query.dto';
import {
  ContinueWatchingItemDto,
  ContinueWatchingResponseDto,
  WatchHistoryResponseDto,
  ResumePlaybackDto,
} from '@netflix/shared-types';

@Injectable()
export class WatchHistoryService {
  private readonly logger = new Logger(WatchHistoryService.name);

  constructor(
    @InjectRepository(WatchHistory)
    private readonly watchHistoryRepository: Repository<WatchHistory>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Episode)
    private readonly episodeRepository: Repository<Episode>,
    private readonly redisService: RedisService,
  ) {}

  async reportProgress(dto: ReportWatchProgressDto): Promise<WatchHistory> {
    if (!dto.movieId && !dto.episodeId) {
      throw new BadRequestException('Either movieId or episodeId must be provided');
    }

    const profile = await this.profileRepository.findOne({ where: { id: dto.profileId } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID "${dto.profileId}" not found`);
    }

    if (dto.movieId) {
      const movie = await this.movieRepository.findOne({ where: { id: dto.movieId } });
      if (!movie) {
        throw new NotFoundException(`Movie with ID "${dto.movieId}" not found`);
      }
    }

    if (dto.episodeId) {
      const episode = await this.episodeRepository.findOne({ where: { id: dto.episodeId } });
      if (!episode) {
        throw new NotFoundException(`Episode with ID "${dto.episodeId}" not found`);
      }
    }

    const duration = Math.max(1, dto.durationSeconds);
    const progressPercentage = Math.min(
      100,
      Math.round(((dto.positionSeconds / duration) * 100) * 100) / 100,
    );
    const completed = dto.completed === true || progressPercentage >= 95;

    // Check for existing progress record
    let record: WatchHistory | null = null;
    if (dto.movieId) {
      record = await this.watchHistoryRepository.findOne({
        where: { profileId: dto.profileId, movieId: dto.movieId },
      });
    } else if (dto.episodeId) {
      record = await this.watchHistoryRepository.findOne({
        where: { profileId: dto.profileId, episodeId: dto.episodeId },
      });
    }

    const now = new Date();

    if (record) {
      record.positionSeconds = dto.positionSeconds;
      record.durationSeconds = dto.durationSeconds;
      record.progressPercentage = progressPercentage;
      record.completed = completed;
      record.lastWatchedAt = now;
      record = await this.watchHistoryRepository.save(record);
    } else {
      record = this.watchHistoryRepository.create({
        profileId: dto.profileId,
        movieId: dto.movieId,
        episodeId: dto.episodeId,
        positionSeconds: dto.positionSeconds,
        durationSeconds: dto.durationSeconds,
        progressPercentage,
        completed,
        lastWatchedAt: now,
      });
      record = await this.watchHistoryRepository.save(record);
    }

    // Cache latest progress in Redis for rapid resume reads (24 hours TTL)
    const contentKey = dto.movieId || dto.episodeId;
    const redisProgressKey = `watch:progress:${dto.profileId}:${contentKey}`;
    await this.redisService.set(
      redisProgressKey,
      {
        contentId: contentKey,
        positionSeconds: dto.positionSeconds,
        durationSeconds: dto.durationSeconds,
        progressPercentage,
        completed,
        lastWatchedAt: now.toISOString(),
        episodeId: dto.episodeId,
      },
      86400,
    );

    // Invalidate continue watching cache
    await this.redisService.del(`watch:continue:${dto.profileId}`);

    return record;
  }

  async getContinueWatching(profileId: string): Promise<ContinueWatchingResponseDto> {
    const cacheKey = `watch:continue:${profileId}`;
    const cached = await this.redisService.get<ContinueWatchingResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Query in-progress content (position > 10s, completed = false), sorted newest first
    const records = await this.watchHistoryRepository.find({
      where: {
        profileId,
        completed: false,
      },
      relations: [
        'movie',
        'movie.genres',
        'episode',
        'episode.season',
        'episode.season.series',
        'episode.season.series.genres',
      ],
      order: {
        lastWatchedAt: 'DESC',
      },
      take: 20,
    });

    const filteredRecords = records.filter((r) => r.positionSeconds > 10);

    const items: ContinueWatchingItemDto[] = filteredRecords.map((item) => {
      if (item.movieId && item.movie) {
        const remainingMinutes = Math.max(
          0,
          Math.round((item.durationSeconds - item.positionSeconds) / 60),
        );
        return {
          id: item.id,
          profileId: item.profileId,
          contentId: item.movie.id,
          title: item.movie.title,
          description: item.movie.description,
          posterUrl: item.movie.posterUrl,
          backdropUrl: item.movie.backdropUrl,
          isSeries: false,
          movieId: item.movieId,
          positionSeconds: item.positionSeconds,
          durationSeconds: item.durationSeconds,
          progressPercentage: Number(item.progressPercentage),
          remainingMinutes,
          completed: item.completed,
          lastWatchedAt: item.lastWatchedAt.toISOString(),
        };
      }

      const ep = item.episode;
      const series = ep?.season?.series;
      const season = ep?.season;
      const remainingMinutes = Math.max(
        0,
        Math.round((item.durationSeconds - item.positionSeconds) / 60),
      );

      return {
        id: item.id,
        profileId: item.profileId,
        contentId: series?.id || ep?.id || item.id,
        title: series?.title || ep?.title || 'Unknown Series',
        subtitle: ep ? `S${season?.seasonNumber || 1}:E${ep.episodeNumber} ${ep.title}` : undefined,
        description: ep?.description || series?.description,
        posterUrl: series?.posterUrl || ep?.thumbnailUrl || '',
        backdropUrl: series?.backdropUrl || ep?.thumbnailUrl || '',
        isSeries: true,
        seriesId: series?.id,
        seasonNumber: season?.seasonNumber,
        episodeNumber: ep?.episodeNumber,
        episodeId: item.episodeId,
        positionSeconds: item.positionSeconds,
        durationSeconds: item.durationSeconds,
        progressPercentage: Number(item.progressPercentage),
        remainingMinutes,
        completed: item.completed,
        lastWatchedAt: item.lastWatchedAt.toISOString(),
      };
    });

    const result: ContinueWatchingResponseDto = {
      items,
      total: items.length,
    };

    // Cache in Redis for 60 seconds
    await this.redisService.set(cacheKey, result, 60);

    return result;
  }

  async getWatchHistory(query: WatchHistoryQueryDto): Promise<WatchHistoryResponseDto> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const [records, total] = await this.watchHistoryRepository.findAndCount({
      where: { profileId: query.profileId },
      relations: [
        'movie',
        'movie.genres',
        'episode',
        'episode.season',
        'episode.season.series',
      ],
      order: {
        lastWatchedAt: 'DESC',
      },
      skip,
      take: limit,
    });

    const items = records.map((record) => {
      const ep = record.episode;
      const series = ep?.season?.series;
      const season = ep?.season;

      return {
        id: record.id,
        profileId: record.profileId,
        movieId: record.movieId,
        movie: record.movie
          ? {
              id: record.movie.id,
              title: record.movie.title,
              slug: record.movie.slug,
              description: record.movie.description,
              releaseDate:
                record.movie.releaseDate instanceof Date
                  ? record.movie.releaseDate.toISOString()
                  : String(record.movie.releaseDate),
              durationMinutes: record.movie.durationMinutes,
              ageRating: record.movie.ageRating,
              language: record.movie.language,
              country: record.movie.country,
              posterUrl: record.movie.posterUrl,
              backdropUrl: record.movie.backdropUrl,
              status: record.movie.status,
              viewCount: record.movie.viewCount,
              averageRating: Number(record.movie.averageRating) || 0,
              genres: record.movie.genres
                ? record.movie.genres.map((g) => ({
                    id: g.id,
                    name: g.name,
                    slug: g.slug,
                  }))
                : [],
            }
          : undefined,
        episodeId: record.episodeId,
        episode: ep
          ? {
              id: ep.id,
              seasonId: ep.seasonId,
              episodeNumber: ep.episodeNumber,
              title: ep.title,
              description: ep.description,
              durationMinutes: ep.durationMinutes,
              thumbnailUrl: ep.thumbnailUrl,
              seriesTitle: series?.title,
              seasonNumber: season?.seasonNumber,
              seriesId: series?.id,
            }
          : undefined,
        positionSeconds: record.positionSeconds,
        durationSeconds: record.durationSeconds,
        progressPercentage: Number(record.progressPercentage),
        completed: record.completed,
        lastWatchedAt: record.lastWatchedAt.toISOString(),
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getResumePlayback(
    profileId: string,
    movieId?: string,
    episodeId?: string,
  ): Promise<ResumePlaybackDto> {
    if (!movieId && !episodeId) {
      throw new BadRequestException('Either movieId or episodeId must be provided');
    }

    const contentKey = (movieId || episodeId) as string;
    const redisProgressKey = `watch:progress:${profileId}:${contentKey}`;

    // Fast path: Check Redis cache
    const cached = await this.redisService.get<ResumePlaybackDto>(redisProgressKey);
    if (cached) {
      return cached;
    }

    // Database lookup
    let record: WatchHistory | null = null;
    if (movieId) {
      record = await this.watchHistoryRepository.findOne({
        where: { profileId, movieId },
        relations: ['movie'],
      });
    } else if (episodeId) {
      record = await this.watchHistoryRepository.findOne({
        where: { profileId, episodeId },
        relations: ['episode', 'episode.season'],
      });
    }

    if (!record) {
      return {
        contentId: contentKey,
        positionSeconds: 0,
        durationSeconds: 0,
        progressPercentage: 0,
        completed: false,
      };
    }

    const result: ResumePlaybackDto = {
      contentId: contentKey,
      positionSeconds: record.positionSeconds,
      durationSeconds: record.durationSeconds,
      progressPercentage: Number(record.progressPercentage),
      completed: record.completed,
      lastWatchedAt: record.lastWatchedAt.toISOString(),
      episodeId: record.episodeId,
      seasonNumber: record.episode?.season?.seasonNumber,
      episodeNumber: record.episode?.episodeNumber,
    };

    // Populate Redis cache
    await this.redisService.set(redisProgressKey, result, 86400);

    return result;
  }

  async removeFromWatchHistory(
    id: string,
    profileId: string,
  ): Promise<{ success: boolean; message: string }> {
    const record = await this.watchHistoryRepository.findOne({
      where: { id, profileId },
    });

    if (!record) {
      throw new NotFoundException(`Watch history entry with ID "${id}" not found`);
    }

    const contentKey = record.movieId || record.episodeId;
    await this.watchHistoryRepository.remove(record);

    // Invalidate Redis caches
    await this.redisService.del(`watch:continue:${profileId}`);
    if (contentKey) {
      await this.redisService.del(`watch:progress:${profileId}:${contentKey}`);
    }

    return {
      success: true,
      message: 'Item removed from watch history',
    };
  }

  async clearWatchHistory(
    profileId: string,
  ): Promise<{ success: boolean; message: string; deletedCount: number }> {
    const records = await this.watchHistoryRepository.find({
      where: { profileId },
    });

    if (records.length > 0) {
      await this.watchHistoryRepository.remove(records);
    }

    // Invalidate Redis caches
    await this.redisService.del(`watch:continue:${profileId}`);
    for (const r of records) {
      const contentKey = r.movieId || r.episodeId;
      if (contentKey) {
        await this.redisService.del(`watch:progress:${profileId}:${contentKey}`);
      }
    }

    return {
      success: true,
      message: 'Watch history cleared successfully',
      deletedCount: records.length,
    };
  }
}
