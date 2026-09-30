import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  User,
  Profile,
  Genre,
  Category,
  SubscriptionPlan,
  Movie,
  Series,
  Season,
  Episode,
  MediaAsset,
  Subtitle,
  AudioTrack,
} from '../entities';
import {
  SEED_GENRES,
  SEED_CATEGORIES,
  SEED_SUBSCRIPTION_PLANS,
  SEED_USERS,
  SEED_MOVIES,
  SEED_SERIES,
} from './seed.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async runSeed(): Promise<{
    genres: number;
    categories: number;
    plans: number;
    users: number;
    movies: number;
    series: number;
  }> {
    this.logger.log('Starting database seeding...');

    return await this.dataSource.transaction(async (manager) => {
      // 1. Seed Genres
      let seededGenresCount = 0;
      for (const item of SEED_GENRES) {
        const existing = await manager.findOne(Genre, { where: { slug: item.slug } });
        if (!existing) {
          const genre = manager.create(Genre, item);
          await manager.save(genre);
          seededGenresCount++;
        }
      }

      // 2. Seed Categories
      let seededCategoriesCount = 0;
      for (const item of SEED_CATEGORIES) {
        const existing = await manager.findOne(Category, { where: { slug: item.slug } });
        if (!existing) {
          const category = manager.create(Category, item);
          await manager.save(category);
          seededCategoriesCount++;
        }
      }

      // 3. Seed Subscription Plans
      let seededPlansCount = 0;
      for (const item of SEED_SUBSCRIPTION_PLANS) {
        const existing = await manager.findOne(SubscriptionPlan, { where: { name: item.name } });
        if (!existing) {
          const plan = manager.create(SubscriptionPlan, item);
          await manager.save(plan);
          seededPlansCount++;
        }
      }

      // 4. Seed Users and Profiles
      let seededUsersCount = 0;
      for (const userData of SEED_USERS) {
        const existingUser = await manager.findOne(User, { where: { email: userData.email } });
        if (!existingUser) {
          const user = manager.create(User, {
            email: userData.email,
            passwordHash: userData.passwordHash,
            role: userData.role,
            isEmailVerified: userData.isEmailVerified,
          });
          const savedUser = await manager.save(user);

          for (const profileData of userData.profiles) {
            const profile = manager.create(Profile, {
              userId: savedUser.id,
              name: profileData.name,
              avatarUrl: profileData.avatarUrl,
              isKids: profileData.isKids,
              maturityRating: profileData.maturityRating,
              language: profileData.language,
            });
            await manager.save(profile);
          }
          seededUsersCount++;
        }
      }

      // 5. Seed Movies with MediaAssets & Subtitles
      let seededMoviesCount = 0;
      for (const movieData of SEED_MOVIES) {
        const existing = await manager.findOne(Movie, { where: { slug: movieData.slug } });
        if (!existing) {
          // Create Media Asset
          const mediaAsset = manager.create(MediaAsset, {
            masterPlaylistUrl: movieData.masterPlaylistUrl,
            durationSeconds: movieData.durationMinutes * 60,
            status: 'READY',
            thumbnailUrl: movieData.posterUrl,
          });
          const savedAsset = await manager.save(mediaAsset);

          // Subtitles & Audio
          const enSubtitle = manager.create(Subtitle, {
            mediaAssetId: savedAsset.id,
            language: 'en',
            label: 'English [CC]',
            url: `https://storage.streamflix.local/subtitles/${movieData.slug}-en.vtt`,
            isDefault: true,
          });
          const esSubtitle = manager.create(Subtitle, {
            mediaAssetId: savedAsset.id,
            language: 'es',
            label: 'Español',
            url: `https://storage.streamflix.local/subtitles/${movieData.slug}-es.vtt`,
            isDefault: false,
          });
          await manager.save([enSubtitle, esSubtitle]);

          const mainAudio = manager.create(AudioTrack, {
            mediaAssetId: savedAsset.id,
            language: 'en',
            label: 'English [Original]',
            isDefault: true,
          });
          await manager.save(mainAudio);

          // Find Genres
          const genres = await manager.find(Genre);
          const matchedGenres = genres.filter((g) => movieData.genreSlugs.includes(g.slug));

          const movie = manager.create(Movie, {
            title: movieData.title,
            slug: movieData.slug,
            description: movieData.description,
            releaseDate: movieData.releaseDate,
            durationMinutes: movieData.durationMinutes,
            ageRating: movieData.ageRating,
            language: movieData.language,
            country: movieData.country,
            posterUrl: movieData.posterUrl,
            backdropUrl: movieData.backdropUrl,
            trailerUrl: movieData.trailerUrl,
            status: movieData.status,
            viewCount: movieData.viewCount,
            averageRating: movieData.averageRating,
            mediaAssetId: savedAsset.id,
            genres: matchedGenres,
          });
          await manager.save(movie);
          seededMoviesCount++;
        }
      }

      // 6. Seed Series, Seasons, and Episodes
      let seededSeriesCount = 0;
      for (const seriesData of SEED_SERIES) {
        const existing = await manager.findOne(Series, { where: { slug: seriesData.slug } });
        if (!existing) {
          const genres = await manager.find(Genre);
          const matchedGenres = genres.filter((g) => seriesData.genreSlugs.includes(g.slug));

          const series = manager.create(Series, {
            title: seriesData.title,
            slug: seriesData.slug,
            description: seriesData.description,
            releaseDate: seriesData.releaseDate,
            ageRating: seriesData.ageRating,
            language: seriesData.language,
            posterUrl: seriesData.posterUrl,
            backdropUrl: seriesData.backdropUrl,
            status: seriesData.status,
            genres: matchedGenres,
          });
          const savedSeries = await manager.save(series);

          for (const seasonData of seriesData.seasons) {
            const season = manager.create(Season, {
              seriesId: savedSeries.id,
              seasonNumber: seasonData.seasonNumber,
              title: seasonData.title,
              description: seasonData.description,
            });
            const savedSeason = await manager.save(season);

            for (const epData of seasonData.episodes) {
              const epAsset = manager.create(MediaAsset, {
                masterPlaylistUrl: epData.masterPlaylistUrl,
                durationSeconds: epData.durationMinutes * 60,
                status: 'READY',
                thumbnailUrl: epData.thumbnailUrl,
              });
              const savedEpAsset = await manager.save(epAsset);

              const episode = manager.create(Episode, {
                seasonId: savedSeason.id,
                episodeNumber: epData.episodeNumber,
                title: epData.title,
                description: epData.description,
                durationMinutes: epData.durationMinutes,
                thumbnailUrl: epData.thumbnailUrl,
                mediaAssetId: savedEpAsset.id,
              });
              await manager.save(episode);
            }
          }
          seededSeriesCount++;
        }
      }

      this.logger.log('Database seeding finished successfully.');
      return {
        genres: seededGenresCount,
        categories: seededCategoriesCount,
        plans: seededPlansCount,
        users: seededUsersCount,
        movies: seededMoviesCount,
        series: seededSeriesCount,
      };
    });
  }
}
