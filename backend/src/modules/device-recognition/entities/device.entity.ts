import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  brand: string;

  @Column()
  @Index()
  model: string;

  @Column({ nullable: true })
  variant: string;

  @Column({ nullable: true })
  generation: string;

  @Column({ nullable: true })
  releaseYear: number;

  @Column({ nullable: true })
  displaySize: string;

  @Column({ nullable: true })
  displayType: string;

  @Column({ nullable: true })
  processor: string;

  @Column({ nullable: true })
  ram: string;

  @Column({ nullable: true, type: 'simple-json' })
  storageOptions: string[];

  @Column({ nullable: true })
  batteryCapacity: string;

  @Column({ nullable: true })
  cameraSpecs: string;

  @Column({ nullable: true })
  operatingSystem: string;

  @Column({ nullable: true, type: 'simple-json' })
  colors: string[];

  @Column({ nullable: true, type: 'float' })
  weight: number;

  @Column({ nullable: true, type: 'simple-json' })
  dimensions: { height: number; width: number; depth: number; unit: string };

  @Column({ nullable: true, type: 'simple-json' })
  connectivity: string[];

  @Column({ nullable: true, type: 'simple-json' })
  sensors: string[];

  @Column({ nullable: true, type: 'simple-json' })
  marketPrices: {
    condition: string;
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    updatedAt: Date;
  }[];

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true, type: 'simple-json' })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
