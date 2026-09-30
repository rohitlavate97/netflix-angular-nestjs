export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  CONTENT_MANAGER = 'CONTENT_MANAGER',
  MODERATOR = 'MODERATOR',
}

export enum UserPermission {
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  CONTENT_CREATE = 'CONTENT_CREATE',
  CONTENT_READ = 'CONTENT_READ',
  CONTENT_UPDATE = 'CONTENT_UPDATE',
  CONTENT_DELETE = 'CONTENT_DELETE',
  MEDIA_UPLOAD = 'MEDIA_UPLOAD',
  MEDIA_DELETE = 'MEDIA_DELETE',
  ANALYTICS_READ = 'ANALYTICS_READ',
  SUBSCRIPTION_READ = 'SUBSCRIPTION_READ',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isEmailVerified: boolean;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
