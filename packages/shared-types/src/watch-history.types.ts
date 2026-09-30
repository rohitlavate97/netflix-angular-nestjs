import { MovieDto, EpisodeDto } from './content.types';

export interface ReportWatchProgressDto {
  profileId: string;
  movieId?: string;
  episodeId?: string;
  positionSeconds: number;
  durationSeconds: number;
  completed?: boolean;
}

export interface WatchHistoryItemDto {
  id: string;
  profileId: string;
  movieId?: string;
  movie?: MovieDto;
  episodeId?: string;
  episode?: EpisodeDto & {
    seriesTitle?: string;
    seasonNumber?: number;
    seriesId?: string;
  };
  positionSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  completed: boolean;
  lastWatchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContinueWatchingItemDto {
  id: string;
  profileId: string;
  contentId: string;
  title: string;
  subtitle?: string;
  description?: string;
  posterUrl: string;
  backdropUrl: string;
  isSeries: boolean;
  movieId?: string;
  episodeId?: string;
  seriesId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  positionSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  remainingMinutes: number;
  completed: boolean;
  lastWatchedAt: string;
}

export interface WatchHistoryResponseDto {
  items: WatchHistoryItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContinueWatchingResponseDto {
  items: ContinueWatchingItemDto[];
  total: number;
}

export interface ResumePlaybackDto {
  contentId: string;
  positionSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  completed: boolean;
  lastWatchedAt?: string;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}
