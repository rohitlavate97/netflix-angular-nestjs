import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subtitle } from './subtitle.entity';
import { AudioTrack } from './audio-track.entity';

@Entity('media_assets')
export class MediaAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 1000 })
  masterPlaylistUrl: string;

  @Column({ type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ type: 'simple-array', default: '1080p,720p,480p,360p' })
  resolutions: string[];

  @Column({
    type: 'varchar',
    length: 20,
    default: 'READY',
  })
  status: 'PROCESSING' | 'READY' | 'FAILED';

  @Column({ type: 'varchar', length: 1000, nullable: true })
  thumbnailUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storageKey?: string;

  @OneToMany(() => Subtitle, (subtitle) => subtitle.mediaAsset, { cascade: true })
  subtitles: Subtitle[];

  @OneToMany(() => AudioTrack, (track) => track.mediaAsset, { cascade: true })
  audioTracks: AudioTrack[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
