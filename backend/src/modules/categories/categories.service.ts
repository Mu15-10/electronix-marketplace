import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/entities/listing.entity';
import { DEVICE_CATEGORIES } from '@marketplace/shared';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async findAll() {
    const results = await Promise.all(
      DEVICE_CATEGORIES.map(async (cat) => {
        const count = await this.listingRepository.count({
          where: { categoryId: cat.id, status: 'active' },
        });
        return { ...cat, listings_count: count };
      }),
    );
    return { results };
  }

  async findById(id: string) {
    const category = DEVICE_CATEGORIES.find((c) => c.id === id);
    if (!category) throw new NotFoundException('Category not found');
    const count = await this.listingRepository.count({
      where: { categoryId: id, status: 'active' },
    });
    return { ...category, listings_count: count };
  }

  async getListings(id: string, page = 1, limit = 20) {
    const category = DEVICE_CATEGORIES.find((c) => c.id === id);
    if (!category) throw new NotFoundException('Category not found');
    const skip = (page - 1) * limit;
    const [items, total] = await this.listingRepository.findAndCount({
      where: { categoryId: id, status: 'active' },
      relations: ['seller'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { results: items, count: total, page, limit };
  }
}
