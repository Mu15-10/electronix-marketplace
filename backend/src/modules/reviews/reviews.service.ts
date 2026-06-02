import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { EscrowTransaction, EscrowStatus } from '../escrow/entities/escrow.entity';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class ReviewsService {
  private readonly logger = new LoggerService('ReviewsService');

  constructor(
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Listing) private readonly listingRepository: Repository<Listing>,
    @InjectRepository(EscrowTransaction) private readonly escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto): Promise<Review> {
    const listing = await this.listingRepository.findOne({ where: { id: dto.listingId } });
    if (!listing) throw new NotFoundException('Listing not found');

    const transaction = await this.escrowRepository.findOne({
      where: { id: dto.transactionId, buyerId: userId, listingId: dto.listingId },
    });
    if (!transaction) throw new BadRequestException('Transaction not found or not completed');
    if (transaction.status !== EscrowStatus.COMPLETED) throw new BadRequestException('Transaction not completed yet');

    const existing = await this.reviewRepository.findOne({
      where: { authorId: userId, listingId: dto.listingId },
    });
    if (existing) throw new BadRequestException('You have already reviewed this listing');

    const review = this.reviewRepository.create({
      rating: dto.rating,
      title: dto.title,
      content: dto.content,
      images: dto.images,
      listingId: dto.listingId,
      sellerId: listing.sellerId,
      authorId: userId,
      transactionId: dto.transactionId,
      isVerifiedPurchase: true,
    });

    const saved = await this.reviewRepository.save(review);

    const avg = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.sellerId = :sellerId', { sellerId: listing.sellerId })
      .getRawOne();
    if (avg?.avg) {
      await this.reviewRepository.metadata.connection
        .getRepository(User.name)
        ?.update(listing.sellerId, { trustScore: parseFloat(avg.avg) * 20 });
    }

    await this.auditLogRepository.save({
      action: AuditAction.CREATE,
      description: `Review created for listing ${dto.listingId}`,
      entityType: 'review',
      entityId: saved.id,
      userId,
    });

    return saved;
  }

  async getListingReviews(listingId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.reviewRepository.findAndCount({
      where: { listingId, isDeleted: false },
      relations: ['author'],
      skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserReviews(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.reviewRepository.findAndCount({
      where: { sellerId: userId, isDeleted: false },
      relations: ['author', 'listing'],
      skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReview(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id }, relations: ['author', 'listing'] });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async markHelpful(reviewId: string, userId: string): Promise<Review> {
    const review = await this.getReview(reviewId);
    if (review.helpfulBy?.includes(userId)) {
      review.helpfulBy = review.helpfulBy.filter((id) => id !== userId);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      review.helpfulBy = [...(review.helpfulBy || []), userId];
      review.helpfulCount += 1;
    }
    return this.reviewRepository.save(review);
  }

  async reportReview(reviewId: string, reason: string): Promise<void> {
    const review = await this.getReview(reviewId);
    review.isFlagged = true;
    review.flagReason = reason;
    review.flaggedAt = new Date();
    await this.reviewRepository.save(review);
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.getReview(reviewId);
    if (review.authorId !== userId) throw new ForbiddenException('Not your review');
    review.isDeleted = true;
    await this.reviewRepository.save(review);
  }

  async calculateSellerRating(sellerId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.sellerId = :sellerId', { sellerId })
      .andWhere('review.isDeleted = false')
      .getRawOne();
    return { averageRating: parseFloat(result?.avg || '0'), totalReviews: parseInt(result?.count || '0', 10) };
  }
}
