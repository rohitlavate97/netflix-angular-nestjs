export enum ContentType {
  MOVIE = 'MOVIE',
  SERIES = 'SERIES',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface GenreDto {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
}

export interface MediaAssetDto {
  id: string;
  masterPlaylistUrl: string;
  durationSeconds: number;
  resolutions: string[];
  thumbnailUrl?: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
}

export interface MovieDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  releaseDate: string;
  durationMinutes: number;
  ageRating: string;
  language: string;
  country: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  cast?: string[];
  genres: GenreDto[];
  mediaAsset?: MediaAssetDto;
  status: ContentStatus;
  viewCount: number;
  averageRating: number;
}

export interface EpisodeDto {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description?: string;
  durationMinutes: number;
  thumbnailUrl: string;
  mediaAsset?: MediaAssetDto;
}

export interface SeasonDto {
  id: string;
  seriesId: string;
  seasonNumber: number;
  title: string;
  description?: string;
  episodes: EpisodeDto[];
}

export interface SeriesDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  releaseDate: string;
  ageRating: string;
  language: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  cast?: string[];
  genres: GenreDto[];
  seasons: SeasonDto[];
  status: ContentStatus;
  averageRating?: number;
}

export interface ContentCategoryRowDto {
  category: CategoryDto;
  movies: MovieDto[];
  series: SeriesDto[];
}

export interface ContentFilterQuery {
  genre?: string;
  ageRating?: string;
  status?: ContentStatus;
  search?: string;
  limit?: number;
  offset?: number;
}
