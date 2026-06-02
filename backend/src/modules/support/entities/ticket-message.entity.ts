import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { SupportTicket } from './support-ticket.entity';

export enum SenderRole {
  USER = 'user',
  AGENT = 'agent',
  ADMIN = 'admin',
}

@Entity('ticket_messages')
export class TicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  ticketId: string;

  @Column()
  senderId: string;

  @Column({ type: 'enum', enum: SenderRole })
  senderRole: SenderRole;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'simple-json', nullable: true })
  attachments: { url: string; name: string; type: string }[];

  @Column({ default: false })
  isInternal: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
