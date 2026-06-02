import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, Index,
} from 'typeorm';
import { Advertisement } from './advertisement.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
}

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sellerId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  budget: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  dailyBudget: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz' })
  endDate: Date;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  @Index()
  status: CampaignStatus;

  @Column({ type: 'simple-json', nullable: true })
  targeting: {
    locations?: string[];
    devices?: string[];
    categories?: string[];
    userTypes?: string[];
  };

  @Column({ type: 'int', default: 0 })
  totalImpressions: number;

  @Column({ type: 'int', default: 0 })
  totalClicks: number;

  @Column({ type: 'int', default: 0 })
  totalConversions: number;

  @OneToMany(() => Advertisement, (ad) => ad.campaignId)
  ads: Advertisement[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
