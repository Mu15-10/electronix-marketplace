import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Warranty } from './warranty.entity';

export enum ClaimStatus {
  OPEN = 'open',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
}

@Entity('warranty_claims')
export class WarrantyClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  warrantyId: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.OPEN })
  @Index()
  status: ClaimStatus;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  evidence: { url: string; type: string; description?: string }[];

  @Column({ nullable: true, type: 'text' })
  resolution: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ nullable: true, type: 'timestamptz' })
  resolvedAt: Date;

  @ManyToOne(() => Warranty)
  @JoinColumn({ name: 'warrantyId' })
  warranty: Warranty;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
