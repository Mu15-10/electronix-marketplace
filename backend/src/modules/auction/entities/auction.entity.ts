import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index, OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { Bid } from './bid.entity';

export enum AuctionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  ENDED = 'ended',
  SOLD = 'sold',
  UNSOLD = 'unsold',
}

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  listingId: string;

  @Column()
  @Index()
  sellerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  startPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  reservePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentBid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  minBidIncrement: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  extendedEnd: Date;

  @Column({ type: 'enum', enum: AuctionStatus, default: AuctionStatus.PENDING })
  @Index()
  status: AuctionStatus;

  @Column({ nullable: true })
  winnerId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  winningBid: number;

  @Column({ type: 'timestamptz', nullable: true })
  soldAt: Date;

  @Column({ default: true })
  autoExtend: boolean;

  @Column({ type: 'int', default: 5 })
  extensionMinutes: number;

  @Column({ type: 'int', default: 0 })
  bidCount: number;

  @Column({ type: 'int', default: 0 })
  watcherCount: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
