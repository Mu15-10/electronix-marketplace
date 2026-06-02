import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seller, SellerVerificationStatus } from './entities/seller.entity';
import { User, SellerLevel } from '../users/entities/user.entity';
import { BecomeSellerDto } from './dto/become-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { Review } from '../reviews/entities/review.entity';
import { EscrowTransaction, EscrowStatus } from '../escrow/entities/escrow.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class SellersService {
  private readonly logger = new LoggerService('SellersService');

  constructor(
    @InjectRepository(Seller) private readonly sellerRepository: Repository<Seller>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Listing) private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Review) private readonly reviewRepository: Repository<Review>,
    @InjectRepository(EscrowTransaction) private readonly escrowRepository: Repository<EscrowTransaction>,
  ) {}

  async becomeSeller(userId: string, dto: BecomeSellerDto): Promise<Seller> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isSeller) throw new BadRequestException('Already a seller');

    const existingUsername = await this.sellerRepository.findOne({ where: { username: dto.username } });
    if (existingUsername) throw new ConflictException('Username already taken');

    const seller = this.sellerRepository.create({
      userId,
      username: dto.username,
      storeName: dto.storeName || dto.username,
      description: dto.description,
      country: dto.country,
      city: dto.city,
      phoneNumber: dto.phoneNumber,
      verificationStatus: SellerVerificationStatus.UNVERIFIED,
    });

    const saved = await this.sellerRepository.save(seller);
    user.isSeller = true;
    user.sellerLevel = SellerLevel.BRONZE;
    user.username = dto.username;
    await this.userRepository.save(user);

    return saved;
  }

  async getSellerProfile(userId: string): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!seller) throw new NotFoundException('Seller profile not found');
    return seller;
  }

  async getSellerByUsername(username: string): Promise<Seller> {
    const seller = await this.sellerRepository.findOne({
      where: { username },
      relations: ['user'],
    });
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async updateSellerProfile(userId: string, dto: UpdateSellerDto): Promise<Seller> {
    const seller = await this.getSellerProfile(userId);
    Object.assign(seller, dto);
    return this.sellerRepository.save(seller);
  }

  async getSellerDashboard(userId: string): Promise<any> {
    const seller = await this.getSellerProfile(userId);
    const activeListings = await this.listingRepository.count({ where: { sellerId: userId, status: ListingStatus.ACTIVE } });
    const totalSales = await this.escrowRepository.count({ where: { sellerId: userId, status: EscrowStatus.COMPLETED } });
    const pendingTransactions = await this.escrowRepository.count({ where: { sellerId: userId, status: EscrowStatus.FUNDED } });

    return {
      profile: seller,
      stats: { activeListings, totalSales, pendingTransactions, totalRevenue: seller.totalRevenue, averageRating: seller.averageRating },
    };
  }

  async getSellerListings(sellerId: string, status?: ListingStatus, pagination?: { page: number; limit: number }): Promise<PaginatedResult<Listing>> {
    const { page = 1, limit = 20 } = pagination || {};
    const skip = (page - 1) * limit;
    const where: any = { sellerId };
    if (status) where.status = status;
    const [items, total] = await this.listingRepository.findAndCount({ where, skip, take: limit, order: { createdAt: 'DESC' } });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSellerAnalytics(sellerId: string, timeRange: string): Promise<any> {
    const now = new Date();
    let start: Date;
    switch (timeRange) {
      case '7d': start = new Date(now.getTime() - 7 * 86400000); break;
      case '30d': start = new Date(now.getTime() - 30 * 86400000); break;
      case '90d': start = new Date(now.getTime() - 90 * 86400000); break;
      default: start = new Date(now.getTime() - 30 * 86400000);
    }

    const transactions = await this.escrowRepository.createQueryBuilder('escrow')
      .where('escrow.sellerId = :sellerId', { sellerId })
      .andWhere('escrow.createdAt >= :start', { start })
      .andWhere('escrow.status = :status', { status: EscrowStatus.COMPLETED })
      .getMany();
    const revenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    return { totalSales: transactions.length, totalRevenue: revenue, timeRange };
  }

  async getSellerReviews(sellerId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Review>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.reviewRepository.findAndCount({
      where: { sellerId, isDeleted: false },
      relations: ['author', 'listing'],
      skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateSellerLevel(userId: string): Promise<void> {
    const stats = await this.escrowRepository.find({ where: { sellerId: userId, status: EscrowStatus.COMPLETED } });
    const totalSales = stats.length;
    const totalRevenue = stats.reduce((s, t) => s + parseFloat(t.amount.toString()), 0);

    let level = SellerLevel.BRONZE;
    if (totalSales >= 500 && totalRevenue >= 50000) level = SellerLevel.DIAMOND;
    else if (totalSales >= 200 && totalRevenue >= 20000) level = SellerLevel.PLATINUM;
    else if (totalSales >= 100 && totalRevenue >= 10000) level = SellerLevel.GOLD;
    else if (totalSales >= 50 && totalRevenue >= 5000) level = SellerLevel.SILVER;

    await this.userRepository.update(userId, { sellerLevel: level });
  }

  async calculateSellerTrustScore(userId: string): Promise<number> {
    const reviews = await this.reviewRepository.find({ where: { sellerId: userId } });
    if (reviews.length === 0) return 0;
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    return Math.round((avgRating / 5) * 100);
  }

  async getTopSellers(limit = 10): Promise<Seller[]> {
    return this.sellerRepository.find({
      order: { totalRevenue: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }
}
