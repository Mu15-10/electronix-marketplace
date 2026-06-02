import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  SYSTEM = 'system',
  MESSAGE = 'message',
  LISTING_APPROVED = 'listing_approved',
  LISTING_REJECTED = 'listing_rejected',
  LISTING_SOLD = 'listing_sold',
  NEW_OFFER = 'new_offer',
  OFFER_ACCEPTED = 'offer_accepted',
  PAYMENT_RECEIVED = 'payment_received',
  SHIPPING_UPDATE = 'shipping_update',
  REVIEW_RECEIVED = 'review_received',
  DISPUTE_UPDATE = 'dispute_update',
  VERIFICATION_COMPLETE = 'verification_complete',
  SECURITY_ALERT = 'security_alert',
  PROMOTIONAL = 'promotional',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  @Index()
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'simple-json', nullable: true })
  data: Record<string, any>;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  readAt: Date;

  @Column({ type: 'enum', enum: NotificationChannel, default: NotificationChannel.IN_APP })
  channel: NotificationChannel;

  @Column({ default: false })
  isSent: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  sentAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
