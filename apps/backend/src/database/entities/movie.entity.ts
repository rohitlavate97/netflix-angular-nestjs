import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { ContentStatus } from '@netflix/shared-types';
import { Genre } from './genre.entity';
import { MediaAsset } from './media-asset.entity';
import { WatchHistory } from './watch-history.entity';
import { Watchlist } from './watchlist.entity';
import { Rating } from './rating.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  releaseDate: Date;

  @Column({ type: 'int', default: 120 })
  durationMinutes: number;

  @Column({ type: 'varchar', length: 10, default: '16+' })
  ageRating: string;

  @Column({ type: 'varchar', length: 20, default: 'English' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'USA' })
  country: string;

  @Column({ type: 'varchar', length: 1000 })
  posterUrl: string;

  @Column({ type: 'varchar', length: 1000 })
  backdropUrl: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  trailerUrl?: string;

  @Column({
    type: 'enum',
    enum: ContentStatus,
    default: ContentStatus.PUBLISHED,
  })
  status: ContentStatus;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 0.0 })
  averageRating: number;

  @ManyToMany(() => Genre, (genre) => genre.movies, { cascade: true })
  @JoinTable({
    name: 'movie_genres',
    joinColumn: { name: 'movieId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genreId', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @Column({ type: 'uuid', nullable: true })
  mediaAssetId?: string;

  @ManyToOne(() => MediaAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mediaAssetId' })
  mediaAsset?: MediaAsset;

  @OneToMany(() => WatchHistory, (history) => history.movie)
  watchHistories: WatchHistory[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.movie)
  watchlists: Watchlist[];

  @OneToMany(() => Rating, (rating) => rating.movie)
  ratings: Rating[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
