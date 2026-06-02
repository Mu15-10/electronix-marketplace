import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Listing, ListingStatus, DeviceCondition } from './entities/listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingFilterDto } from './dto/listing-filter.dto';
import { User } from '../users/entities/user.entity';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ListingsService {
  private readonly logger = new LoggerService('ListingsService');

  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(dto: CreateListingDto, userId: string): Promise<Listing> {
    const slug = dto.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 80) + '-' + uuid().substring(0, 8);

    const listing = this.listingRepository.create({
      ...dto,
      sellerId: userId,
      status: ListingStatus.PENDING,
      viewCount: 0,
      watchCount: 0,
      favoriteCount: 0,
      fraudRiskScore: 0,
      isFraudChecked: false,
      seoData: {
        slug,
        metaTitle: dto.title,
        metaDescription: dto.description.substring(0, 160),
      },
      images: dto.images || [],
      tags: dto.tags || [],
    });

    const saved = await this.listingRepository.save(listing);

    await this.auditLogRepository.save({
      action: AuditAction.CREATE,
      description: `Listing created: ${saved.title}`,
      entityType: 'listing',
      entityId: saved.id,
      userId,
    });

    return saved;
  }

  async findAll(filters: ListingFilterDto): Promise<PaginatedResult<Listing>> {
    const {
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC',
      search, categoryId, brand, model, condition, listingType,
      priceMin, priceMax, location, status,
    } = filters;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Listing> = {};
    where.status = status || ListingStatus.ACTIVE;

    if (search) {
      where.title = Like(`%${search}%`);
    }
    if (categoryId) where.categoryId = categoryId;
    if (brand) where.brand = Like(`%${brand}%`);
    if (model) where.model = Like(`%${model}%`);
    if (condition) where.condition = condition;
    if (listingType) where.listingType = listingType;
    if (location) where.location = Like(`%${location}%`);
    if (priceMin !== undefined && priceMax !== undefined) {
      where.price = Between(priceMin, priceMax);
    } else if (priceMin !== undefined) {
      where.price = MoreThanOrEqual(priceMin);
    } else if (priceMax !== undefined) {
      where.price = LessThanOrEqual(priceMax);
    }

    const [items, total] = await this.listingRepository.findAndCount({
      where,
      relations: ['seller'],
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return {
      results: items,
      count: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    } as any;
  }

  async findById(id: string): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id },
      relations: ['seller'],
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async update(id: string, dto: UpdateListingDto, userId: string): Promise<Listing> {
    const listing = await this.findById(id);
    if (listing.sellerId !== userId) {
      throw new ForbiddenException('You can only edit your own listings');
    }
    Object.assign(listing, dto);
    await this.listingRepository.save(listing);

    await this.auditLogRepository.save({
      action: AuditAction.UPDATE,
      description: `Listing updated: ${listing.title}`,
      entityType: 'listing',
      entityId: id,
      userId,
    });

    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<void> {
    const listing = await this.findById(id);
    if (listing.sellerId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }
    await this.listingRepository.softDelete(id);

    await this.auditLogRepository.save({
      action: AuditAction.DELETE,
      description: `Listing deleted: ${listing.title}`,
      entityType: 'listing',
      entityId: id,
      userId,
    });
  }

  async approve(id: string, moderatorId: string): Promise<Listing> {
    const listing = await this.findById(id);
    listing.status = ListingStatus.ACTIVE;
    listing.approvedAt = new Date();
    listing.approvedBy = moderatorId;
    await this.listingRepository.save(listing);

    await this.auditLogRepository.save({
      action: AuditAction.APPROVE,
      description: `Listing approved: ${listing.title}`,
      entityType: 'listing',
      entityId: id,
      userId: moderatorId,
    });

    return listing;
  }

  async reject(id: string, moderatorId: string, reason: string): Promise<Listing> {
    const listing = await this.findById(id);
    listing.status = ListingStatus.REJECTED;
    listing.rejectionReason = reason;
    await this.listingRepository.save(listing);

    await this.auditLogRepository.save({
      action: AuditAction.REJECT,
      description: `Listing rejected: ${listing.title}. Reason: ${reason}`,
      entityType: 'listing',
      entityId: id,
      userId: moderatorId,
    });

    return listing;
  }

  async flag(id: string, reason: string): Promise<Listing> {
    const listing = await this.findById(id);
    listing.status = ListingStatus.FLAGGED;
    await this.listingRepository.save(listing);

    await this.auditLogRepository.save({
      action: AuditAction.FLAG,
      description: `Listing flagged: ${reason}`,
      entityType: 'listing',
      entityId: id,
    });

    return listing;
  }

  async getSellerListings(sellerId: string, status?: ListingStatus): Promise<Listing[]> {
    const where: FindOptionsWhere<Listing> = { sellerId };
    if (status) where.status = status;
    return this.listingRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async incrementViews(id: string): Promise<void> {
    await this.listingRepository.increment({ id }, 'viewCount', 1);
  }

  async getSimilarListings(id: string, limit = 6): Promise<Listing[]> {
    const listing = await this.findById(id);
    const queryBuilder = this.listingRepository.createQueryBuilder('listing')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE })
      .andWhere('listing.id != :id', { id })
      .andWhere('(listing.brand = :brand OR listing.categoryId = :categoryId)', {
        brand: listing.brand,
        categoryId: listing.categoryId,
      })
      .orderBy('listing.viewCount', 'DESC')
      .take(limit);

    return queryBuilder.getMany();
  }

  async getTrending(): Promise<Listing[]> {
    return this.listingRepository.find({
      where: { status: ListingStatus.ACTIVE },
      order: { viewCount: 'DESC', watchCount: 'DESC' },
      take: 20,
      relations: ['seller'],
    });
  }

  async searchSuggestions(query: string): Promise<string[]> {
    const results = await this.listingRepository.find({
      where: { title: Like(`%${query}%`), status: ListingStatus.ACTIVE },
      select: ['title'],
      take: 10,
    });
    return [...new Set(results.map((r) => r.title))];
  }
}
