import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true, type: 'simple-json' })
  attachments: { url: string; type: string; name: string; size: number }[];

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  readAt: Date;

  @Column({ default: false })
  isFlagged: boolean;

  @Column({ nullable: true })
  flagReason: string;

  @Column({ type: 'float', default: 0 })
  fraudRiskScore: number;

  @Column({ default: false })
  isSystemMessage: boolean;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  conversationId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
