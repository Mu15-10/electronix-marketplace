import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { SearchQueryDto } from './dto/search-query.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async search(query: SearchQueryDto): Promise<PaginatedResult<Listing>> {
    const {
      q, category, brand, model, condition, priceMin, priceMax,
      location, sortBy = 'createdAt', sortOrder = 'DESC',
      page = 1, limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.listingRepository.createQueryBuilder('listing')
      .leftJoinAndSelect('listing.seller', 'seller')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE });

    if (q) {
      queryBuilder.andWhere(
        '(listing.title ILIKE :q OR listing.description ILIKE :q OR listing.brand ILIKE :q OR listing.model ILIKE :q)',
        { q: `%${q}%` },
      );
    }
    if (category) queryBuilder.andWhere('listing.categoryName = :category', { category });
    if (brand) queryBuilder.andWhere('listing.brand ILIKE :brand', { brand: `%${brand}%` });
    if (model) queryBuilder.andWhere('listing.model ILIKE :model', { model: `%${model}%` });
    if (condition) queryBuilder.andWhere('listing.condition = :condition', { condition });
    if (priceMin) queryBuilder.andWhere('listing.price >= :priceMin', { priceMin });
    if (priceMax) queryBuilder.andWhere('listing.price <= :priceMax', { priceMax });
    if (location) queryBuilder.andWhere('listing.location ILIKE :location', { location: `%${location}%` });

    const allowedSortFields = ['price', 'createdAt', 'viewCount', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`listing.${sortField}`, sortOrder);

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { results: items, count: total, page, limit, totalPages: Math.ceil(total / limit) } as any;
  }

  async autocomplete(query: string): Promise<string[]> {
    const results = await this.listingRepository.find({
      where: [
        { title: Like(`%${query}%`), status: ListingStatus.ACTIVE },
        { brand: Like(`%${query}%`), status: ListingStatus.ACTIVE },
        { model: Like(`%${query}%`), status: ListingStatus.ACTIVE },
      ],
      select: ['title', 'brand', 'model'],
      take: 10,
    });

    const suggestions = new Set<string>();
    results.forEach((r) => {
      if (r.title.toLowerCase().includes(query.toLowerCase())) suggestions.add(r.title);
      if (r.brand?.toLowerCase().includes(query.toLowerCase())) suggestions.add(r.brand);
      if (r.model?.toLowerCase().includes(query.toLowerCase())) suggestions.add(r.model);
    });

    return Array.from(suggestions).slice(0, 10);
  }

  async getPopularSearches(): Promise<string[]> {
    return ['iPhone 15', 'Samsung Galaxy S24', 'MacBook Pro', 'AirPods Pro', 'PlayStation 5', 'iPad Air', 'Google Pixel 8'];
  }

  async indexListing(listing: Listing): Promise<void> {
    this.listingRepository.save(listing);
  }

  async removeFromIndex(listingId: string): Promise<void> {
    this.listingRepository.softDelete(listingId);
  }
}
