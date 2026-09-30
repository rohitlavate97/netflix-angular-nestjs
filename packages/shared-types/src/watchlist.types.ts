import { MovieDto, SeriesDto } from './content.types';

export type WatchlistContentType = 'movie' | 'series';

export interface AddToWatchlistDto {
  profileId: string;
  contentId: string;
  contentType: WatchlistContentType;
}

export interface WatchlistItemDto {
  id: string;
  profileId: string;
  movieId?: string;
  seriesId?: string;
  movie?: MovieDto;
  series?: SeriesDto;
  createdAt: string;
}

export interface WatchlistResponseDto {
  items: WatchlistItemDto[];
  total: number;
}

export interface WatchlistCheckResponseDto {
  inWatchlist: boolean;
  watchlistItemId?: string;
}
