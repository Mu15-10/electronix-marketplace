import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum VerificationType {
  IDENTITY = 'identity',
  ADDRESS = 'address',
  BUSINESS = 'business',
  FACE_MATCH = 'face_match',
  LIVENESS = 'liveness',
  PHONE = 'phone',
  EMAIL = 'email',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: VerificationType })
  @Index()
  type: VerificationType;

  @Column({ type: 'enum', enum: VerificationStatus, default: VerificationStatus.PENDING })
  @Index()
  status: VerificationStatus;

  @Column({ nullable: true, type: 'simple-json' })
  documents: { url: string; type: string; name: string; uploadedAt: Date }[];

  @Column({ nullable: true, type: 'simple-json' })
  metadata: Record<string, any>;

  @Column({ nullable: true, type: 'float' })
  confidenceScore: number;

  @Column({ nullable: true, type: 'text' })
  rejectionReason: string;

  @Column({ nullable: true, type: 'timestamptz' })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedById: string;

  @Column({ nullable: true, type: 'timestamptz' })
  rejectedAt: Date;

  @Column({ nullable: true })
  rejectedById: string;

  @Column({ nullable: true, type: 'timestamptz' })
  expiresAt: Date;

  @ManyToOne(() => User)
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
