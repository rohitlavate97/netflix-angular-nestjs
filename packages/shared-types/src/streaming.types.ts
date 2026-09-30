export interface StreamPlaybackInfo {
  streamUrl: string;
  drmScheme?: string;
  playbackToken: string;
  expiresAt: string;
  resolutions: string[];
  subtitles: SubtitleTrackDto[];
  audioTracks: AudioTrackDto[];
}

export interface SubtitleTrackDto {
  id: string;
  language: string;
  label: string;
  url: string;
  isDefault: boolean;
}

export interface AudioTrackDto {
  id: string;
  language: string;
  label: string;
  url?: string;
  isDefault: boolean;
}

export interface WatchProgressDto {
  contentId: string;
  episodeId?: string;
  positionSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  completed: boolean;
  updatedAt: string;
}
