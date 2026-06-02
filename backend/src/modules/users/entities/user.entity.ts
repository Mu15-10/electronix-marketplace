import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, ManyToMany, JoinTable, Index,
} from 'typeorm';
import { Listing } from '../../listings/entities/listing.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';
import { AuditLog } from '../../audit/entities/audit.entity';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  INACTIVE = 'inactive',
}

export enum SellerLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ unique: true, nullable: true })
  @Index()
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true, type: 'timestamptz' })
  passwordResetExpires: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ nullable: true, type: 'simple-json' })
  twoFactorBackupCodes: string[];

  @Column({ nullable: true, type: 'timestamptz' })
  lastLoginAt: Date;

  @Column({ nullable: true })
  lastLoginIp: string;

  @Column({ type: 'float', default: 0 })
  trustScore: number;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  website: string;

  @Column({
    type: 'enum',
    enum: SellerLevel,
    nullable: true,
  })
  sellerLevel: SellerLevel;

  @Column({ default: false })
  isSeller: boolean;

  @Column({ nullable: true, type: 'text' })
  refreshToken: string;

  @Column({ nullable: true, type: 'simple-json' })
  socialLinks: { platform: string; url: string }[];

  @Column({ nullable: true, type: 'simple-json' })
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true, type: 'timestamptz' })
  lockedUntil: Date;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Listing, (listing) => listing.seller)
  listings: Listing[];

  @OneToMany(() => Review, (review) => review.author)
  reviewsWritten: Review[];

  @OneToMany(() => Review, (review) => review.seller)
  reviewsReceived: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];
}
