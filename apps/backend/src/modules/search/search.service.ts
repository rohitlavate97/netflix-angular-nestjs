import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../../database/entities/movie.entity';
import { Series } from '../../database/entities/series.entity';
import { RedisService } from '../redis/redis.service';
import { SearchQueryDto } from './dto/search-query.dto';
import {
  SearchResultItemDto,
  SearchResultsResponseDto,
  SearchEntityType,
  SearchSortBy,
  ContentStatus,
} from '@netflix/shared-types';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly SEARCH_CACHE_TTL = 300; // 5 minutes

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    private readonly redisService: RedisService,
  ) {}

  async search(query: SearchQueryDto): Promise<SearchResultsResponseDto> {
    const rawTerm = (query.q || '').trim();
    if (!rawTerm) {
      return {
        query: '',
        items: [],
        total: 0,
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages: 0,
      };
    }

    const type = query.type || SearchEntityType.ALL;
    const genre = query.genre || '';
    const ageRating = query.ageRating || '';
    const sortBy = query.sortBy || SearchSortBy.RELEVANCE;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const cacheKey = `search:v1:${rawTerm.toLowerCase()}:${type}:${genre}:${ageRating}:${sortBy}:${page}:${limit}`;

    const cached = await this.redisService.get<SearchResultsResponseDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for search key: ${cacheKey}`);
      return cached;
    }

    const term = `%${rawTerm.toLowerCase()}%`;
    const searchItems: SearchResultItemDto[] = [];

    // Search Movies
    if (type === SearchEntityType.ALL || type === SearchEntityType.MOVIE) {
      const movieQb = this.movieRepository
        .createQueryBuilder('movie')
        .leftJoinAndSelect('movie.genres', 'genre')
        .where('movie.status = :status', { status: ContentStatus.PUBLISHED })
        .andWhere(
          '(LOWER(movie.title) LIKE :term OR LOWER(movie.description) LIKE :term OR LOWER(genre.name) LIKE :term OR LOWER(genre.slug) LIKE :term)',
          { term },
        );

      if (genre) {
        movieQb.andWhere('genre.slug = :genreSlug', { genreSlug: genre });
      }

      if (ageRating) {
        movieQb.andWhere('movie.ageRating = :ageRating', { ageRating });
      }

      const movies = await movieQb.getMany();
      for (const movie of movies) {
        searchItems.push({
          id: movie.id,
          title: movie.title,
          slug: movie.slug,
          description: movie.description,
          type: 'movie',
          posterUrl: movie.posterUrl,
          backdropUrl: movie.backdropUrl,
          releaseDate:
            movie.releaseDate instanceof Date
              ? movie.releaseDate.toISOString()
              : String(movie.releaseDate),
          ageRating: movie.ageRating,
          durationMinutes: movie.durationMinutes,
          averageRating: Number(movie.averageRating) || 0,
          genres: movie.genres
            ? movie.genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug }))
            : [],
        });
      }
    }

    // Search Series
    if (type === SearchEntityType.ALL || type === SearchEntityType.SERIES) {
      const seriesQb = this.seriesRepository
        .createQueryBuilder('series')
        .leftJoinAndSelect('series.genres', 'genre')
        .leftJoinAndSelect('series.seasons', 'season')
        .where('series.status = :status', { status: ContentStatus.PUBLISHED })
        .andWhere(
          '(LOWER(series.title) LIKE :term OR LOWER(series.description) LIKE :term OR LOWER(genre.name) LIKE :term OR LOWER(genre.slug) LIKE :term)',
          { term },
        );

      if (genre) {
        seriesQb.andWhere('genre.slug = :genreSlug', { genreSlug: genre });
      }

      if (ageRating) {
        seriesQb.andWhere('series.ageRating = :ageRating', { ageRating });
      }

      const seriesList = await seriesQb.getMany();
      for (const series of seriesList) {
        searchItems.push({
          id: series.id,
          title: series.title,
          slug: series.slug,
          description: series.description,
          type: 'series',
          posterUrl: series.posterUrl,
          backdropUrl: series.backdropUrl,
          releaseDate:
            series.releaseDate instanceof Date
              ? series.releaseDate.toISOString()
              : String(series.releaseDate),
          ageRating: series.ageRating,
          seasonsCount: series.seasons ? series.seasons.length : 0,
          averageRating: 4.8,
          genres: series.genres
            ? series.genres.map((g) => ({ id: g.id, name: g.name, slug: g.slug }))
            : [],
        });
      }
    }

    // Sort items
    const lowerQuery = rawTerm.toLowerCase();
    searchItems.sort((a, b) => {
      switch (sortBy) {
        case SearchSortBy.NEWEST: {
          const timeA = new Date(a.releaseDate).getTime();
          const timeB = new Date(b.releaseDate).getTime();
          return timeB - timeA;
        }
        case SearchSortBy.RATING: {
          const ratingA = a.averageRating ?? 0;
          const ratingB = b.averageRating ?? 0;
          return ratingB - ratingA;
        }
        case SearchSortBy.TITLE: {
          return a.title.localeCompare(b.title);
        }
        case SearchSortBy.RELEVANCE:
        default: {
          const scoreA = this.computeRelevanceScore(a, lowerQuery);
          const scoreB = this.computeRelevanceScore(b, lowerQuery);
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          return (b.averageRating ?? 0) - (a.averageRating ?? 0);
        }
      }
    });

    const total = searchItems.length;
    const totalPages = Math.ceil(total / limit) || (total > 0 ? 1 : 0);
    const paginatedItems = searchItems.slice((page - 1) * limit, page * limit);

    const result: SearchResultsResponseDto = {
      query: rawTerm,
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
    };

    await this.redisService.set(cacheKey, result, this.SEARCH_CACHE_TTL);
    return result;
  }

  private computeRelevanceScore(item: SearchResultItemDto, query: string): number {
    const title = item.title.toLowerCase();
    if (title === query) return 100;
    if (title.startsWith(query)) return 80;
    if (title.includes(query)) return 60;
    if (item.description.toLowerCase().includes(query)) return 40;
    if (item.genres.some((g) => g.name.toLowerCase().includes(query))) return 30;
    return 10;
  }
}
