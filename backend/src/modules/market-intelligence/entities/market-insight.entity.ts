import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum InsightType {
  DEMAND = 'demand',
  PRICE = 'price',
  TREND = 'trend',
  BEHAVIOR = 'behavior',
  REGIONAL = 'regional',
}

export enum InsightPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('market_insights')
export class MarketInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: InsightType })
  @Index()
  type: InsightType;

  @Column()
  @Index()
  category: string;

  @Column({ nullable: true })
  @Index()
  brand: string;

  @Column({ nullable: true })
  @Index()
  model: string;

  @Column({ type: 'simple-json' })
  data: Record<string, any>;

  @Column({ type: 'float' })
  score: number;

  @Column({ type: 'enum', enum: InsightPeriod, default: InsightPeriod.WEEKLY })
  period: InsightPeriod;

  @Column({ type: 'timestamptz' })
  generatedAt: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
