import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Movie } from './movie.entity';
import { Episode } from './episode.entity';

@Entity('watch_history')
@Index(['profileId', 'movieId'])
@Index(['profileId', 'episodeId'])
export class WatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.watchHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({ type: 'uuid', nullable: true })
  movieId?: string;

  @ManyToOne(() => Movie, (movie) => movie.watchHistories, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie?: Movie;

  @Column({ type: 'uuid', nullable: true })
  episodeId?: string;

  @ManyToOne(() => Episode, (ep) => ep.watchHistories, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'episodeId' })
  episode?: Episode;

  @Column({ type: 'int', default: 0 })
  positionSeconds: number;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  progressPercentage: number;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  lastWatchedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
