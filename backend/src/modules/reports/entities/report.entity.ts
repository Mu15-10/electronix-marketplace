import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReportType {
  LISTING = 'listing',
  USER = 'user',
  REVIEW = 'review',
  MESSAGE = 'message',
  SELLER = 'seller',
}

export enum ReportStatus {
  PENDING = 'pending',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReportType })
  @Index()
  reportType: ReportType;

  @Column()
  @Index()
  targetId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  @Index()
  status: ReportStatus;

  @Column({ nullable: true, type: 'text' })
  action: string;

  @Column({ nullable: true, type: 'text' })
  moderatorNotes: string;

  @Column({ nullable: true, type: 'timestamptz' })
  resolvedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column()
  @Index()
  reporterId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderatorId' })
  moderator: User;

  @Column({ nullable: true })
  moderatorId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
