import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MediaAsset } from './media-asset.entity';

@Entity('audio_tracks')
export class AudioTrack {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  mediaAssetId: string;

  @ManyToOne(() => MediaAsset, (asset) => asset.audioTracks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mediaAssetId' })
  mediaAsset: MediaAsset;

  @Column({ type: 'varchar', length: 10 })
  language: string;

  @Column({ type: 'varchar', length: 50 })
  label: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  url?: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
