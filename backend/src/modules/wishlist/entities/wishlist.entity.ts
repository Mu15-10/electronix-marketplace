import {
  Entity, PrimaryGeneratedColumn, CreateDateColumn,
  ManyToOne, JoinColumn, Index, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Listing } from '../../listings/entities/listing.entity';

@Entity('wishlist')
@Unique(['userId', 'listingId'])
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.wishlist)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => Listing, (listing) => listing.wishlistEntries)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @Column()
  @Index()
  listingId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
