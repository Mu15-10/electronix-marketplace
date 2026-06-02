import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { CommissionType } from './commission-config.entity';

export enum CommissionTransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
}

@Entity('commission_transactions')
export class CommissionTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  transactionId: string;

  @Column()
  @Index()
  sellerId: string;

  @Column({ nullable: true })
  listingId: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  saleAmount: number;

  @Column({ type: 'enum', enum: CommissionType })
  commissionType: CommissionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  commissionAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netAmount: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'enum', enum: CommissionTransactionStatus, default: CommissionTransactionStatus.PENDING })
  @Index()
  status: CommissionTransactionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
