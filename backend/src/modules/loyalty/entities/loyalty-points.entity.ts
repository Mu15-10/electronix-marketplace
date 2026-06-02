import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  Index,
} from 'typeorm';

export enum PointsType {
  EARNED = 'earned',
  SPENT = 'spent',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
}

export enum PointsReferenceType {
  PURCHASE = 'purchase',
  REVIEW = 'review',
  REFERRAL = 'referral',
  BONUS = 'bonus',
  REWARD = 'reward',
}

@Entity('loyalty_points')
export class LoyaltyPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'int' })
  points: number;

  @Column({ length: 255 })
  reason: string;

  @Column({ type: 'enum', enum: PointsType })
  type: PointsType;

  @Column({ type: 'enum', enum: PointsReferenceType })
  referenceType: PointsReferenceType;

  @Column({ nullable: true })
  referenceId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
