import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';

export enum ReferralStatus {
  PENDING = 'pending',
  CONVERTED = 'converted',
  EXPIRED = 'expired',
  REWARDED = 'rewarded',
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  referrerId: string;

  @Column()
  @Index()
  referredId: string;

  @Column({ length: 20 })
  @Index()
  referralCode: string;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  @Index()
  status: ReferralStatus;

  @Column({ type: 'timestamptz', nullable: true })
  convertedAt: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  rewardAmount: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
