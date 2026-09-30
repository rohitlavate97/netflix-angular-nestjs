import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoreSchema1710000000000 implements MigrationInterface {
  name = 'CoreSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // 1. Users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "passwordHash" VARCHAR(255) NOT NULL,
        "role" VARCHAR(50) NOT NULL DEFAULT 'USER',
        "isEmailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" ("email");
    `);

    // 2. Profiles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "name" VARCHAR(50) NOT NULL,
        "avatarUrl" VARCHAR(500) NOT NULL DEFAULT 'https://assets.streamflix.local/avatars/default.png',
        "isKids" BOOLEAN NOT NULL DEFAULT FALSE,
        "maturityRating" VARCHAR(10) NOT NULL DEFAULT '18+',
        "language" VARCHAR(10) NOT NULL DEFAULT 'en',
        "pin" VARCHAR(255),
        "autoplayNext" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_profiles_userId" ON "profiles" ("userId");
      CREATE INDEX IF NOT EXISTS "idx_profiles_user_name" ON "profiles" ("userId", "name");
    `);

    // 3. Refresh Tokens
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "tokenHash" VARCHAR(255) NOT NULL UNIQUE,
        "expiresAt" TIMESTAMPTZ NOT NULL,
        "isRevoked" BOOLEAN NOT NULL DEFAULT FALSE,
        "userAgent" VARCHAR(500),
        "ipAddress" VARCHAR(50),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_userId" ON "refresh_tokens" ("userId");
    `);

    // 4. Genres
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "genres" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL UNIQUE,
        "slug" VARCHAR(100) NOT NULL UNIQUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_genres_slug" ON "genres" ("slug");
    `);

    // 5. Categories
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) NOT NULL UNIQUE,
        "displayOrder" INT NOT NULL DEFAULT 0,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories" ("slug");
    `);

    // 6. Media Assets
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "media_assets" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "masterPlaylistUrl" VARCHAR(1000) NOT NULL,
        "durationSeconds" INT NOT NULL DEFAULT 0,
        "resolutions" TEXT NOT NULL DEFAULT '1080p,720p,480p,360p',
        "status" VARCHAR(20) NOT NULL DEFAULT 'READY',
        "thumbnailUrl" VARCHAR(1000),
        "storageKey" VARCHAR(500),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Subtitles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subtitles" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "mediaAssetId" UUID NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
        "language" VARCHAR(10) NOT NULL,
        "label" VARCHAR(50) NOT NULL,
        "url" VARCHAR(1000) NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_subtitles_mediaAssetId" ON "subtitles" ("mediaAssetId");
    `);

    // 8. Audio Tracks
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audio_tracks" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "mediaAssetId" UUID NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
        "language" VARCHAR(10) NOT NULL,
        "label" VARCHAR(50) NOT NULL,
        "url" VARCHAR(1000),
        "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_audio_tracks_mediaAssetId" ON "audio_tracks" ("mediaAssetId");
    `);

    // 9. Movies
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "movies" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(255) NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "releaseDate" DATE NOT NULL,
        "durationMinutes" INT NOT NULL DEFAULT 120,
        "ageRating" VARCHAR(10) NOT NULL DEFAULT '16+',
        "language" VARCHAR(20) NOT NULL DEFAULT 'English',
        "country" VARCHAR(50) NOT NULL DEFAULT 'USA',
        "posterUrl" VARCHAR(1000) NOT NULL,
        "backdropUrl" VARCHAR(1000) NOT NULL,
        "trailerUrl" VARCHAR(1000),
        "status" VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
        "viewCount" INT NOT NULL DEFAULT 0,
        "averageRating" NUMERIC(3, 1) NOT NULL DEFAULT 0.0,
        "mediaAssetId" UUID REFERENCES "media_assets"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS "idx_movies_slug" ON "movies" ("slug");
      CREATE INDEX IF NOT EXISTS "idx_movies_title" ON "movies" ("title");
      CREATE INDEX IF NOT EXISTS "idx_movies_status" ON "movies" ("status");
    `);

    // 10. Series
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "series" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" VARCHAR(255) NOT NULL,
        "slug" VARCHAR(255) NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "releaseDate" DATE NOT NULL,
        "ageRating" VARCHAR(10) NOT NULL DEFAULT '16+',
        "language" VARCHAR(20) NOT NULL DEFAULT 'English',
        "posterUrl" VARCHAR(1000) NOT NULL,
        "backdropUrl" VARCHAR(1000) NOT NULL,
        "trailerUrl" VARCHAR(1000),
        "status" VARCHAR(50) NOT NULL DEFAULT 'PUBLISHED',
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMPTZ
      );
      CREATE INDEX IF NOT EXISTS "idx_series_slug" ON "series" ("slug");
    `);

    // 11. Seasons
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "seasons" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "seriesId" UUID NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
        "seasonNumber" INT NOT NULL,
        "title" VARCHAR(150) NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "uq_series_season_number" UNIQUE ("seriesId", "seasonNumber")
      );
      CREATE INDEX IF NOT EXISTS "idx_seasons_seriesId" ON "seasons" ("seriesId");
    `);

    // 12. Episodes
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "episodes" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "seasonId" UUID NOT NULL REFERENCES "seasons"("id") ON DELETE CASCADE,
        "episodeNumber" INT NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "durationMinutes" INT NOT NULL DEFAULT 45,
        "thumbnailUrl" VARCHAR(1000) NOT NULL,
        "mediaAssetId" UUID REFERENCES "media_assets"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "uq_season_episode_number" UNIQUE ("seasonId", "episodeNumber")
      );
      CREATE INDEX IF NOT EXISTS "idx_episodes_seasonId" ON "episodes" ("seasonId");
    `);

    // 13. Junction tables
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "movie_genres" (
        "movieId" UUID NOT NULL REFERENCES "movies"("id") ON DELETE CASCADE,
        "genreId" UUID NOT NULL REFERENCES "genres"("id") ON DELETE CASCADE,
        PRIMARY KEY ("movieId", "genreId")
      );

      CREATE TABLE IF NOT EXISTS "series_genres" (
        "seriesId" UUID NOT NULL REFERENCES "series"("id") ON DELETE CASCADE,
        "genreId" UUID NOT NULL REFERENCES "genres"("id") ON DELETE CASCADE,
        PRIMARY KEY ("seriesId", "genreId")
      );
    `);

    // 14. Watch History
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "watch_history" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "profileId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
        "movieId" UUID REFERENCES "movies"("id") ON DELETE CASCADE,
        "episodeId" UUID REFERENCES "episodes"("id") ON DELETE CASCADE,
        "positionSeconds" INT NOT NULL DEFAULT 0,
        "durationSeconds" INT NOT NULL DEFAULT 0,
        "progressPercentage" NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
        "completed" BOOLEAN NOT NULL DEFAULT FALSE,
        "lastWatchedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_watch_history_profile" ON "watch_history" ("profileId");
      CREATE INDEX IF NOT EXISTS "idx_watch_history_profile_movie" ON "watch_history" ("profileId", "movieId");
      CREATE INDEX IF NOT EXISTS "idx_watch_history_profile_episode" ON "watch_history" ("profileId", "episodeId");
    `);

    // 15. Watchlist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "watchlists" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "profileId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
        "movieId" UUID REFERENCES "movies"("id") ON DELETE CASCADE,
        "seriesId" UUID REFERENCES "series"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_watchlist_profile_movie" ON "watchlists" ("profileId", "movieId") WHERE "movieId" IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_watchlist_profile_series" ON "watchlists" ("profileId", "seriesId") WHERE "seriesId" IS NOT NULL;
    `);

    // 16. Ratings
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "ratings" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "profileId" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
        "movieId" UUID REFERENCES "movies"("id") ON DELETE CASCADE,
        "seriesId" UUID REFERENCES "series"("id") ON DELETE CASCADE,
        "score" SMALLINT NOT NULL CHECK ("score" >= 1 AND "score" <= 5),
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_rating_profile_movie" ON "ratings" ("profileId", "movieId") WHERE "movieId" IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS "uq_rating_profile_series" ON "ratings" ("profileId", "seriesId") WHERE "seriesId" IS NOT NULL;
    `);

    // 17. Subscription Plans & Subscriptions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscription_plans" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(50) NOT NULL UNIQUE,
        "tier" VARCHAR(50) NOT NULL,
        "price" NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
        "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
        "maxQuality" VARCHAR(20) NOT NULL DEFAULT 'HD',
        "maxDevices" INT NOT NULL DEFAULT 1,
        "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "planId" UUID NOT NULL REFERENCES "subscription_plans"("id") ON DELETE RESTRICT,
        "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
        "currentPeriodStart" TIMESTAMPTZ NOT NULL,
        "currentPeriodEnd" TIMESTAMPTZ NOT NULL,
        "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_userId" ON "subscriptions" ("userId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "subscriptions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subscription_plans" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ratings" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "watchlists" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "watch_history" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "series_genres" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "movie_genres" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "episodes" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "seasons" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "series" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "movies" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audio_tracks" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "subtitles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media_assets" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "genres" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "profiles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);
  }
}
