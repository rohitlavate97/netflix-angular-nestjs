import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { ContentStatus } from '@netflix/shared-types';
import { Genre } from './genre.entity';
import { Season } from './season.entity';
import { Watchlist } from './watchlist.entity';
import { Rating } from './rating.entity';

@Entity('series')
export class Series {
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

  @Column({ type: 'varchar', length: 10, default: '16+' })
  ageRating: string;

  @Column({ type: 'varchar', length: 20, default: 'English' })
  language: string;

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

  @ManyToMany(() => Genre, (genre) => genre.series, { cascade: true })
  @JoinTable({
    name: 'series_genres',
    joinColumn: { name: 'seriesId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genreId', referencedColumnName: 'id' },
  })
  genres: Genre[];

  @OneToMany(() => Season, (season) => season.series, { cascade: true })
  seasons: Season[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.series)
  watchlists: Watchlist[];

  @OneToMany(() => Rating, (rating) => rating.series)
  ratings: Rating[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
