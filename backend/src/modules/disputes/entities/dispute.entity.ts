import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DisputeStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  DISMISSED = 'dismissed',
}

export enum DisputeReason {
  ITEM_NOT_RECEIVED = 'item_not_received',
  ITEM_NOT_AS_DESCRIBED = 'item_not_as_described',
  COUNTERFEIT = 'counterfeit',
  DAMAGED = 'damaged',
  WRONG_ITEM = 'wrong_item',
  PAYMENT_ISSUE = 'payment_issue',
  SHIPPING_ISSUE = 'shipping_issue',
  OTHER = 'other',
}

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  disputeNumber: string;

  @Column({ type: 'enum', enum: DisputeReason })
  reason: DisputeReason;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.OPEN })
  @Index()
  status: DisputeStatus;

  @Column({ type: 'simple-json', nullable: true })
  evidence: { url: string; type: string; uploadedBy: string; uploadedAt: Date }[];

  @Column({ nullable: true, type: 'text' })
  resolution: string;

  @Column({ nullable: true, type: 'text' })
  moderatorNotes: string;

  @Column({ nullable: true, type: 'timestamptz' })
  resolvedAt: Date;

  @Column({ nullable: true })
  resolvedById: string;

  @Column({ default: false })
  isRefundIssued: boolean;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  refundAmount: number;

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

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderatorId' })
  moderator: User;

  @Column({ nullable: true })
  moderatorId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  listingId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
