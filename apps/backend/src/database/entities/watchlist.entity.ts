import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Movie } from './movie.entity';
import { Series } from './series.entity';

@Entity('watchlists')
@Index(['profileId', 'movieId'], { unique: true })
@Index(['profileId', 'seriesId'], { unique: true })
export class Watchlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.watchlists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({ type: 'uuid', nullable: true })
  movieId?: string;

  @ManyToOne(() => Movie, (movie) => movie.watchlists, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie?: Movie;

  @Column({ type: 'uuid', nullable: true })
  seriesId?: string;

  @ManyToOne(() => Series, (series) => series.watchlists, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seriesId' })
  series?: Series;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
