import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index, OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SellerVerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column({ nullable: true })
  storeName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  bannerUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  businessRegistrationNumber: string;

  @Column({
    type: 'enum',
    enum: SellerVerificationStatus,
    default: SellerVerificationStatus.UNVERIFIED,
  })
  verificationStatus: SellerVerificationStatus;

  @Column({ type: 'int', default: 0 })
  totalListings: number;

  @Column({ type: 'int', default: 0 })
  activeListings: number;

  @Column({ type: 'int', default: 0 })
  totalSales: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'float', default: 0 })
  responseRate: number;

  @Column({ type: 'float', default: 0 })
  responseTime: number;

  @Column({ type: 'float', default: 0 })
  completionRate: number;

  @Column({ type: 'simple-json', nullable: true })
  socialLinks: { platform: string; url: string }[];

  @Column({ nullable: true, type: 'simple-json' })
  paymentInfo: {
    stripeAccountId: string;
    paypalEmail: string;
    bankAccountLast4: string;
  };

  @Column({ nullable: true, type: 'timestamptz' })
  lastActiveAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
