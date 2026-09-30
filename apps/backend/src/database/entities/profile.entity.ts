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
import { MaturityRating } from '@netflix/shared-types';
import { User } from './user.entity';
import { WatchHistory } from './watch-history.entity';
import { Watchlist } from './watchlist.entity';
import { Rating } from './rating.entity';

@Entity('profiles')
@Index(['userId', 'name'])
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.profiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({
    type: 'varchar',
    length: 500,
    default: 'https://assets.streamflix.local/avatars/default.png',
  })
  avatarUrl: string;

  @Column({ type: 'boolean', default: false })
  isKids: boolean;

  @Column({
    type: 'varchar',
    length: 10,
    default: '18+',
  })
  maturityRating: MaturityRating;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  language: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pin?: string;

  @Column({ type: 'boolean', default: true })
  autoplayNext: boolean;

  @OneToMany(() => WatchHistory, (history) => history.profile, { cascade: true })
  watchHistories: WatchHistory[];

  @OneToMany(() => Watchlist, (watchlist) => watchlist.profile, { cascade: true })
  watchlists: Watchlist[];

  @OneToMany(() => Rating, (rating) => rating.profile, { cascade: true })
  ratings: Rating[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
