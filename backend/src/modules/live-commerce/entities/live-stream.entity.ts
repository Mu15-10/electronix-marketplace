import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

export enum StreamStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  ENDED = 'ended',
  CANCELLED = 'cancelled',
}

@Entity('live_streams')
export class LiveStream {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sellerId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: StreamStatus, default: StreamStatus.SCHEDULED })
  @Index()
  status: StreamStatus;

  @Column({ type: 'timestamptz' })
  scheduledStart: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  startedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  endedAt: Date;

  @Column({ nullable: true })
  streamUrl: string;

  @Column({ nullable: true })
  playbackUrl: string;

  @Column({ type: 'int', default: 0 })
  viewerCount: number;

  @Column({ type: 'int', default: 0 })
  maxViewers: number;

  @Column({ type: 'simple-json', nullable: true })
  products: { listingId: string; title: string; price: number; imageUrl: string; pinned: boolean }[];

  @Column({ default: true })
  chatEnabled: boolean;

  @Column({ default: false })
  recordingEnabled: boolean;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'simple-json', nullable: true })
  tags: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
