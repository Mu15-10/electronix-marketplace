import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  VIP = 'vip',
}

@Entity('user_loyalty')
export class UserLoyalty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  userId: string;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 0 })
  lifetimePoints: number;

  @Column({ type: 'enum', enum: LoyaltyTier, default: LoyaltyTier.BRONZE })
  currentTier: LoyaltyTier;

  @Column({ type: 'int', default: 0 })
  tierProgress: number;

  @Column({ type: 'int', default: 100 })
  nextTierPoints: number;

  @Column({ type: 'int', default: 0 })
  pointsExpiringSoon: number;

  @Column({ unique: true, length: 20 })
  referralCode: string;

  @Column({ type: 'int', default: 0 })
  referralCount: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
