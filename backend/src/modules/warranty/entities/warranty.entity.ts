import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum WarrantyType {
  MANUFACTURER = 'manufacturer',
  SELLER = 'seller',
  PLATFORM = 'platform',
  EXTENDED = 'extended',
}

export enum WarrantyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CLAIMED = 'claimed',
  VOIDED = 'voided',
}

@Entity('warranties')
export class Warranty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  listingId: string;

  @Column()
  @Index()
  sellerId: string;

  @Column()
  @Index()
  buyerId: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ type: 'enum', enum: WarrantyType })
  type: WarrantyType;

  @Column({ type: 'text' })
  coverage: string;

  @Column({ type: 'int' })
  durationMonths: number;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ type: 'enum', enum: WarrantyStatus, default: WarrantyStatus.ACTIVE })
  @Index()
  status: WarrantyStatus;

  @Column({ default: 0 })
  claimCount: number;

  @Column({ nullable: true })
  termsUrl: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
