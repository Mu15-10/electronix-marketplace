import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TicketMessage } from './ticket-message.entity';

export enum TicketCategory {
  TECHNICAL = 'technical',
  PAYMENT = 'payment',
  VERIFICATION = 'verification',
  SHIPPING = 'shipping',
  FRAUD = 'fraud',
  ACCOUNT = 'account',
  OTHER = 'other',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum TicketStatus {
  OPEN = 'open',
  AWAITING_REPLY = 'awaiting_reply',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketSource {
  WEB = 'web',
  EMAIL = 'email',
  CHAT = 'chat',
  WHATSAPP = 'whatsapp',
  PHONE = 'phone',
}

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ unique: true })
  ticketNumber: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketCategory })
  category: TicketCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  @Index()
  status: TicketStatus;

  @Column({ nullable: true })
  assignedToId: string;

  @Column({ nullable: true, type: 'timestamptz' })
  assignedAt: Date;

  @Column({ type: 'enum', enum: TicketSource, default: TicketSource.WEB })
  source: TicketSource;

  @Column({ type: 'int', nullable: true })
  rating: number;

  @Column({ nullable: true, type: 'timestamptz' })
  resolvedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  closedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
