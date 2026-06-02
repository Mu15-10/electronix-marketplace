import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

export enum EscrowStatus {
  PENDING = 'pending',
  FUNDED = 'funded',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum EscrowFundingType {
  FULL = 'full',
  PARTIAL_DEPOSIT = 'partial_deposit',
}

@Entity('escrow_transactions')
export class EscrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  transactionNumber: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.PENDING,
  })
  status: EscrowStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sellerAmount: number;

  @Column({
    type: 'enum',
    enum: EscrowFundingType,
    default: EscrowFundingType.FULL,
  })
  fundingType: EscrowFundingType;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ nullable: true })
  stripePaymentId: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'timestamptz' })
  fundedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deliveredAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  completedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  cancelledAt: Date;

  @Column({ nullable: true })
  cancelledBy: string;

  @Column({ nullable: true, type: 'text' })
  cancellationReason: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column()
  @Index()
  buyerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  @Index()
  sellerId: string;

  @ManyToOne(() => Listing)
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
