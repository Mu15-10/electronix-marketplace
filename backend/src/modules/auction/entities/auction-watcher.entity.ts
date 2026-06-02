import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Auction } from './auction.entity';

@Entity('auction_watchers')
@Unique(['auctionId', 'userId'])
export class AuctionWatcher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  auctionId: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Auction)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
