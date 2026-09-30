import { GenreDto } from './content.types';

export enum SearchEntityType {
  ALL = 'all',
  MOVIE = 'movie',
  SERIES = 'series',
}

export enum SearchSortBy {
  RELEVANCE = 'relevance',
  NEWEST = 'newest',
  RATING = 'rating',
  TITLE = 'title',
}

export interface SearchQueryDto {
  q: string;
  type?: SearchEntityType;
  genre?: string;
  ageRating?: string;
  sortBy?: SearchSortBy;
  page?: number;
  limit?: number;
}

export interface SearchResultItemDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'movie' | 'series';
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  ageRating: string;
  durationMinutes?: number;
  seasonsCount?: number;
  averageRating?: number;
  genres: GenreDto[];
}

export interface SearchResultsResponseDto {
  query: string;
  items: SearchResultItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
