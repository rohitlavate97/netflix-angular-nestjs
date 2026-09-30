import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Season } from './season.entity';
import { MediaAsset } from './media-asset.entity';
import { WatchHistory } from './watch-history.entity';

@Entity('episodes')
@Index(['seasonId', 'episodeNumber'], { unique: true })
export class Episode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  seasonId: string;

  @ManyToOne(() => Season, (season) => season.episodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seasonId' })
  season: Season;

  @Column({ type: 'int' })
  episodeNumber: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 45 })
  durationMinutes: number;

  @Column({ type: 'varchar', length: 1000 })
  thumbnailUrl: string;

  @Column({ type: 'uuid', nullable: true })
  mediaAssetId?: string;

  @ManyToOne(() => MediaAsset, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'mediaAssetId' })
  mediaAsset?: MediaAsset;

  @OneToMany(() => WatchHistory, (history) => history.episode)
  watchHistories: WatchHistory[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
