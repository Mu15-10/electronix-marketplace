import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ShippingStatus {
  PENDING = 'pending',
  LABEL_CREATED = 'label_created',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
}

export enum DeliveryType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day',
  SCHEDULED = 'scheduled',
  PICKUP = 'pickup',
}

@Entity('shipping_records')
export class Shipping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  transactionId: string;

  @Column()
  provider: string;

  @Column({ nullable: true })
  trackingNumber: string;

  @Column({ type: 'enum', enum: ShippingStatus, default: ShippingStatus.PENDING })
  @Index()
  status: ShippingStatus;

  @Column({ nullable: true, type: 'timestamptz' })
  estimatedDelivery: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deliveredAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ default: 'usd' })
  currency: string;

  @Column()
  senderName: string;

  @Column({ type: 'text' })
  senderAddress: string;

  @Column({ nullable: true })
  senderPhone: string;

  @Column()
  recipientName: string;

  @Column({ type: 'text' })
  recipientAddress: string;

  @Column({ nullable: true })
  recipientPhone: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'simple-json', nullable: true })
  dimensions: { length: number; width: number; height: number; unit: string };

  @Column({ type: 'enum', enum: DeliveryType, default: DeliveryType.STANDARD })
  deliveryType: DeliveryType;

  @Column({ nullable: true })
  deliveryPin: string;

  @Column({ default: false })
  signatureRequired: boolean;

  @Column({ nullable: true })
  photoProof: string;

  @Column({ type: 'simple-json', nullable: true })
  statusHistory: { status: string; timestamp: string; location?: string; note?: string }[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  @Index()
  senderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  @Index()
  recipientId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
