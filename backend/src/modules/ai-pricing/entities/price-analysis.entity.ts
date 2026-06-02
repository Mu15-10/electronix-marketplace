import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('price_analyses')
export class PriceAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  listingId: string;

  @Column()
  @Index()
  deviceBrand: string;

  @Column()
  @Index()
  deviceModel: string;

  @Column({ nullable: true })
  deviceVariant: string;

  @Column({ nullable: true })
  condition: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  recommendedPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxPrice: number;

  @Column({ type: 'float' })
  confidence: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  marketAvgPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  marketMinPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  marketMaxPrice: number;

  @Column({ type: 'int', default: 50 })
  demandScore: number;

  @Column({ type: 'int', default: 50 })
  supplyScore: number;

  @Column({ type: 'simple-json', nullable: true })
  seasonality: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  priceHistory: { date: string; price: number; volume: number }[];

  @Column({ type: 'timestamptz' })
  analysisDate: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
