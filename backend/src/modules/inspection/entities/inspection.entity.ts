import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum InspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

@Entity('inspections')
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  listingId: string;

  @Column()
  @Index()
  inspectorId: string;

  @Column({ type: 'enum', enum: InspectionStatus, default: InspectionStatus.PENDING })
  @Index()
  status: InspectionStatus;

  @Column({ nullable: true })
  deviceAuthenticity: boolean;

  @Column({ nullable: true, type: 'text' })
  deviceCondition: string;

  @Column({ nullable: true, type: 'int' })
  batteryHealth: number;

  @Column({ nullable: true })
  screenCondition: string;

  @Column({ nullable: true })
  cameraFunctionality: string;

  @Column({ type: 'simple-json', nullable: true })
  hardwareIssues: { component: string; issue: string; severity: string }[];

  @Column({ nullable: true })
  imeiValid: boolean;

  @Column({ nullable: true })
  serialValid: boolean;

  @Column({ nullable: true, type: 'text' })
  inspectionReport: string;

  @Column({ nullable: true })
  certificateUrl: string;

  @Column({ nullable: true, type: 'int' })
  score: number;

  @Column({ default: false })
  verifiedBadge: boolean;

  @Column({ nullable: true, type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  completedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'inspectorId' })
  inspector: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
