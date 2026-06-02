import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, ManyToMany, JoinTable, JoinColumn, Index, DeleteDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';

export enum ListingStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  SOLD = 'sold',
  FLAGGED = 'flagged',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum DeviceCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  FOR_PARTS = 'for_parts',
}

export enum ListingType {
  FIXED = 'fixed',
  AUCTION = 'auction',
  BEST_OFFER = 'best_offer',
}

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ type: 'enum', enum: ListingType, default: ListingType.FIXED })
  listingType: ListingType;

  @Column({
    type: 'enum',
    enum: DeviceCondition,
  })
  condition: DeviceCondition;

  @Column({ nullable: true, type: 'text' })
  aiConditionAssessment: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  variant: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  storageCapacity: string;

  @Column({ nullable: true })
  yearOfManufacture: number;

  @Column({ default: false })
  isBoxed: boolean;

  @Column({ default: false })
  hasAccessories: boolean;

  @Column({ nullable: true, type: 'text' })
  accessoriesDescription: string;

  @Column({ type: 'simple-json', nullable: true })
  images: { url: string; isPrimary: boolean; hash?: string }[];

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true, type: 'simple-json' })
  videos: { url: string; thumbnail: string }[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: false })
  isShippingAvailable: boolean;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  shippingCost: number;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.PENDING,
  })
  @Index()
  status: ListingStatus;

  @Column({ nullable: true, type: 'text' })
  rejectionReason: string;

  @Column({ nullable: true, type: 'simple-json' })
  moderationNotes: { moderatorId: string; note: string; timestamp: Date }[];

  @Column({ type: 'int', default: 0 })
  @Index()
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  watchCount: number;

  @Column({ type: 'int', default: 0 })
  favoriteCount: number;

  @Column({ nullable: true, type: 'simple-json' })
  seoData: { slug: string; metaTitle: string; metaDescription: string };

  @Column({ nullable: true, type: 'simple-json' })
  specifications: Record<string, string>;

  @Column({ nullable: true, type: 'simple-json' })
  features: string[];

  @Column({ nullable: true })
  categoryId: string;

  @Column({ nullable: true })
  categoryName: string;

  @Column({ nullable: true, type: 'simple-json' })
  tags: string[];

  @Column({ nullable: true, type: 'timestamptz' })
  expiresAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'float', default: 0 })
  fraudRiskScore: number;

  @Column({ default: false })
  isFraudChecked: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.listings)
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  @Index()
  sellerId: string;

  @OneToMany(() => Review, (review) => review.listing)
  reviews: Review[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.listing)
  wishlistEntries: Wishlist[];
}
