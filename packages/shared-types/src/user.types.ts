export type MaturityRating = 'ALL' | '7+' | '13+' | '16+' | '18+';

export const MAX_PROFILES_PER_USER = 5;

export const DEFAULT_PROFILE_AVATARS = [
  'https://assets.streamflix.local/avatars/netflix-avatar-red.png',
  'https://assets.streamflix.local/avatars/netflix-avatar-blue.png',
  'https://assets.streamflix.local/avatars/netflix-avatar-yellow.png',
  'https://assets.streamflix.local/avatars/netflix-avatar-green.png',
  'https://assets.streamflix.local/avatars/netflix-avatar-kids.png',
] as const;

export interface UserProfileDto {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  maturityRating: MaturityRating;
  language: string;
  hasPin: boolean;
  autoplayNext: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileDto {
  name: string;
  avatarUrl?: string;
  isKids?: boolean;
  maturityRating?: MaturityRating;
  language?: string;
  pin?: string;
  autoplayNext?: boolean;
}

export interface UpdateProfileDto {
  name?: string;
  avatarUrl?: string;
  isKids?: boolean;
  maturityRating?: MaturityRating;
  language?: string;
  pin?: string | null;
  autoplayNext?: boolean;
}

export interface VerifyPinDto {
  pin: string;
}

export interface SelectProfileDto {
  pin?: string;
}

export interface SelectProfileResponse {
  profile: UserProfileDto;
  profileToken?: string;
  selectedAt: string;
}
