import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CommissionType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
}

@Entity('commission_configs')
export class CommissionConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ nullable: true })
  @Index()
  category: string | null;

  @Column({ type: 'enum', enum: CommissionType })
  type: CommissionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minFee: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxFee: number | null;

  @Column({ type: 'int', nullable: true })
  sellerLevel: number | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
