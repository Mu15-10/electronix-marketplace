import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Campaign } from './campaign.entity';

export enum AdType {
  HOMEPAGE = 'homepage',
  CATEGORY = 'category',
  SEARCH = 'search',
  FEATURED = 'featured',
}

export enum AdStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  REJECTED = 'rejected',
}

@Entity('advertisements')
export class Advertisement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sellerId: string;

  @Column({ nullable: true })
  listingId: string;

  @Column({ nullable: true })
  campaignId: string;

  @Column({ type: 'enum', enum: AdType })
  type: AdType;

  @Column()
  placement: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  targetUrl: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.PENDING })
  @Index()
  status: AdStatus;

  @Column({ type: 'int', default: 0 })
  impressions: number;

  @Column({ type: 'int', default: 0 })
  clicks: number;

  @Column({ type: 'float', default: 0 })
  ctr: number;

  @Column({ type: 'float', default: 0 })
  conversionRate: number;

  @Column({ type: 'simple-json', nullable: true })
  targetAudience: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  bidAmount: number;

  @Column({ default: false })
  autoOptimize: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
