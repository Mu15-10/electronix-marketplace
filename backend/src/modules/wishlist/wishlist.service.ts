import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async addItem(userId: string, listingId: string): Promise<Wishlist> {
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const existing = await this.wishlistRepository.findOne({ where: { userId, listingId } });
    if (existing) throw new ConflictException('Already in wishlist');

    const item = this.wishlistRepository.create({ userId, listingId });
    await this.listingRepository.increment({ id: listingId }, 'favoriteCount', 1);
    return this.wishlistRepository.save(item);
  }

  async removeItem(userId: string, listingId: string): Promise<void> {
    const item = await this.wishlistRepository.findOne({ where: { userId, listingId } });
    if (!item) throw new NotFoundException('Item not in wishlist');
    await this.wishlistRepository.delete(item.id);
    await this.listingRepository.decrement({ id: listingId }, 'favoriteCount', 1);
  }

  async getUserWishlist(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Wishlist>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.wishlistRepository.findAndCount({
      where: { userId },
      relations: ['listing', 'listing.seller'],
      skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async checkInWishlist(userId: string, listingId: string): Promise<{ inWishlist: boolean }> {
    const item = await this.wishlistRepository.findOne({ where: { userId, listingId } });
    return { inWishlist: !!item };
  }

  async clearWishlist(userId: string): Promise<void> {
    const items = await this.wishlistRepository.find({ where: { userId } });
    for (const item of items) {
      await this.listingRepository.decrement({ id: item.listingId }, 'favoriteCount', 1);
    }
    await this.wishlistRepository.delete({ userId });
  }
}
