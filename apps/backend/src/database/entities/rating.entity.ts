import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Check,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Movie } from './movie.entity';
import { Series } from './series.entity';

@Entity('ratings')
@Index(['profileId', 'movieId'], { unique: true })
@Index(['profileId', 'seriesId'], { unique: true })
@Check(`"score" >= 1 AND "score" <= 5`)
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  profileId: string;

  @ManyToOne(() => Profile, (profile) => profile.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profileId' })
  profile: Profile;

  @Column({ type: 'uuid', nullable: true })
  movieId?: string;

  @ManyToOne(() => Movie, (movie) => movie.ratings, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movieId' })
  movie?: Movie;

  @Column({ type: 'uuid', nullable: true })
  seriesId?: string;

  @ManyToOne(() => Series, (series) => series.ratings, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seriesId' })
  series?: Series;

  @Column({ type: 'smallint' })
  score: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
