import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum FraudAlertStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  CONFIRMED = 'confirmed',
  DISMISSED = 'dismissed',
}

export enum FraudType {
  PRICE_ANOMALY = 'price_anomaly',
  IMAGE_REUSE = 'image_reuse',
  MULTI_ACCOUNT = 'multi_account',
  SCAM_MESSAGE = 'scam_message',
  SUSPICIOUS_BEHAVIOR = 'suspicious_behavior',
  IDENTITY_THEFT = 'identity_theft',
  PAYMENT_FRAUD = 'payment_fraud',
  REVIEW_MANIPULATION = 'review_manipulation',
  OTHER = 'other',
}

@Entity('fraud_alerts')
export class FraudAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: FraudType })
  @Index()
  fraudType: FraudType;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'float' })
  @Index()
  riskScore: number;

  @Column({ type: 'enum', enum: FraudAlertStatus, default: FraudAlertStatus.OPEN })
  @Index()
  status: FraudAlertStatus;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  targetUserId: string;

  @Column({ nullable: true })
  flaggedById: string;

  @Column({ nullable: true })
  resolvedById: string;

  @Column({ nullable: true, type: 'timestamptz' })
  resolvedAt: Date;

  @Column({ nullable: true, type: 'text' })
  resolution: string;

  @Column({ type: 'simple-json', nullable: true })
  evidence: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
