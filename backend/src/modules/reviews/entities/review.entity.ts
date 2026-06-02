import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'simple-json', nullable: true })
  images: string[];

  @Column({ default: false })
  isVerifiedPurchase: boolean;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ type: 'simple-json', nullable: true })
  helpfulBy: string[];

  @Column({ nullable: true })
  transactionId: string;

  @Column({ default: false })
  isFlagged: boolean;

  @Column({ nullable: true })
  flagReason: string;

  @Column({ nullable: true, type: 'timestamptz' })
  flaggedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => User, (user) => user.reviewsWritten)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  @Index()
  authorId: string;

  @ManyToOne(() => User, (user) => user.reviewsReceived)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  @Index()
  sellerId: string;

  @ManyToOne(() => Listing, (listing) => listing.reviews)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @Column()
  @Index()
  listingId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
