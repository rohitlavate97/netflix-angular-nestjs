export type MaturityRating = 'ALL' | '7+' | '13+' | '16+' | '18+';

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
}
