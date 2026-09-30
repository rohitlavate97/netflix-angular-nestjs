import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchHistory } from '../../database/entities/watch-history.entity';
import { Profile } from '../../database/entities/profile.entity';
import { Movie } from '../../database/entities/movie.entity';
import { Episode } from '../../database/entities/episode.entity';
import { RedisModule } from '../redis/redis.module';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryController } from './watch-history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([WatchHistory, Profile, Movie, Episode]),
    RedisModule,
  ],
  controllers: [WatchHistoryController],
  providers: [WatchHistoryService],
  exports: [WatchHistoryService],
})
export class WatchHistoryModule {}
