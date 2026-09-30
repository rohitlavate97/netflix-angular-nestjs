import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../../database/entities/movie.entity';
import { Series } from '../../database/entities/series.entity';
import { Season } from '../../database/entities/season.entity';
import { Episode } from '../../database/entities/episode.entity';
import { Genre } from '../../database/entities/genre.entity';
import { Category } from '../../database/entities/category.entity';
import { MediaAsset } from '../../database/entities/media-asset.entity';
import { MoviesService } from './services/movies.service';
import { SeriesService } from './services/series.service';
import { GenresService } from './services/genres.service';
import { CategoriesService } from './services/categories.service';
import { MoviesController } from './controllers/movies.controller';
import { SeriesController } from './controllers/series.controller';
import { GenresController } from './controllers/genres.controller';
import { CategoriesController } from './controllers/categories.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movie,
      Series,
      Season,
      Episode,
      Genre,
      Category,
      MediaAsset,
    ]),
    AuthModule,
  ],
  controllers: [
    MoviesController,
    SeriesController,
    GenresController,
    CategoriesController,
  ],
  providers: [
    MoviesService,
    SeriesService,
    GenresService,
    CategoriesService,
  ],
  exports: [
    MoviesService,
    SeriesService,
    GenresService,
    CategoriesService,
  ],
})
export class ContentModule {}
