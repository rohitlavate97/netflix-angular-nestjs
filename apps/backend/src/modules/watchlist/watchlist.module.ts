import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { Watchlist } from '../../database/entities/watchlist.entity';
import { Movie } from '../../database/entities/movie.entity';
import { Series } from '../../database/entities/series.entity';
import { Profile } from '../../database/entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist, Movie, Series, Profile]),
  ],
  controllers: [WatchlistController],
  providers: [WatchlistService],
  exports: [WatchlistService],
})
export class WatchlistModule {}
