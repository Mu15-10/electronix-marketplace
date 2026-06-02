import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { FraudAlert, FraudAlertStatus, FraudType } from './entities/fraud-alert.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { Message } from '../chat/entities/message.entity';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class FraudService {
  private readonly logger = new LoggerService('FraudService');

  constructor(
    @InjectRepository(FraudAlert)
    private readonly fraudAlertRepository: Repository<FraudAlert>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async analyzeListing(listing: Listing, sellerId: string): Promise<FraudAlert | null> {
    let riskScore = 0;
    const factors: string[] = [];

    if (listing.price < 10) {
      riskScore += 15;
      factors.push('Price suspiciously low');
    }
    if (listing.price > 10000) {
      riskScore += 10;
      factors.push('High value item');
    }
    if (!listing.images || listing.images.length === 0) {
      riskScore += 20;
      factors.push('No images provided');
    }
    if (listing.brand && listing.model) {
      const similar = await this.listingRepository.count({
        where: { brand: listing.brand, model: listing.model, status: ListingStatus.ACTIVE },
      });
      if (similar === 0) {
        riskScore += 5;
        factors.push('Unusual brand/model combination');
      }
    }

    const sellerListings = await this.listingRepository.count({
      where: { sellerId, status: ListingStatus.ACTIVE },
    });
    if (sellerListings > 20) {
      riskScore += 10;
      factors.push('High volume seller');
    }

    const alert = await this.autoFlag('listing', listing.id, factors.join('; '), riskScore);
    return alert;
  }

  async analyzeTransaction(buyerId: string, sellerId: string, amount: number): Promise<FraudAlert | null> {
    let riskScore = 0;
    const factors: string[] = [];

    const buyerListings = await this.listingRepository.count({ where: { sellerId: buyerId } });
    if (buyerListings > 0 && amount > 1000) {
      riskScore += 15;
      factors.push('Seller buying high-value item');
    }

    if (riskScore >= 50) {
      return this.autoFlag('transaction', `${buyerId}-${sellerId}`, factors.join('; '), riskScore);
    }
    return null;
  }

  async analyzeUser(userId: string): Promise<FraudAlert | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return null;

    let riskScore = 0;
    const factors: string[] = [];

    if (!user.isEmailVerified) {
      riskScore += 15;
      factors.push('Email not verified');
    }
    if (user.failedLoginAttempts > 3) {
      riskScore += 10;
      factors.push('Multiple failed login attempts');
    }
    if (user.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      riskScore += 10;
      factors.push('Account less than 24 hours old');
    }

    if (riskScore >= 50) {
      return this.autoFlag('user', userId, factors.join('; '), riskScore);
    }
    return null;
  }

  async analyzeMessage(senderId: string, receiverId: string, content: string): Promise<FraudAlert | null> {
    let riskScore = 0;
    const factors: string[] = [];

    const scamPatterns = [
      /wire\s*transfer/i, /western\s*union/i, /money\s*gram/i,
      /outside\s*(escrow|platform)/i, /paypal\s*friend/i,
      /gift\s*card/i, /bitcoin\s*address/i,
      /click\s*(here|this)\s*link/i, /http/i,
    ];

    for (const pattern of scamPatterns) {
      if (pattern.test(content)) {
        riskScore += 25;
        factors.push(`Scam pattern detected: ${pattern}`);
      }
    }

    if (riskScore >= 50) {
      return this.autoFlag('message', `${senderId}-${receiverId}`, factors.join('; '), riskScore);
    }
    return null;
  }

  async detectImageReuse(imageUrls: string[]): Promise<boolean> {
    return false;
  }

  calculateRiskScore(factors: { name: string; weight: number; score: number }[]): number {
    let totalScore = 0;
    for (const factor of factors) {
      totalScore += factor.weight * factor.score;
    }
    return Math.min(100, Math.max(0, totalScore));
  }

  async checkPriceAnomaly(price: number, brand: string, model: string): Promise<{ isAnomaly: boolean; marketAvg: number }> {
    const similar = await this.listingRepository.find({
      where: { brand, model, status: ListingStatus.ACTIVE },
      select: ['price'],
    });

    if (similar.length === 0) return { isAnomaly: false, marketAvg: price };

    const avg = similar.reduce((sum, l) => sum + parseFloat(l.price.toString()), 0) / similar.length;
    const deviation = Math.abs(price - avg) / avg;

    return { isAnomaly: deviation > 0.5, marketAvg: parseFloat(avg.toFixed(2)) };
  }

  async detectMultiAccount(ipAddress: string, deviceFingerprint: string): Promise<string[]> {
    return [];
  }

  async autoFlag(entityType: string, entityId: string, reason: string, riskScore: number): Promise<FraudAlert | null> {
    if (riskScore < 30) return null;

    const existing = await this.fraudAlertRepository.findOne({
      where: { entityType, entityId, status: FraudAlertStatus.OPEN },
    });
    if (existing) return existing;

    const alert = this.fraudAlertRepository.create({
      fraudType: riskScore >= 70 ? FraudType.SUSPICIOUS_BEHAVIOR : FraudType.PRICE_ANOMALY,
      description: reason,
      riskScore,
      entityType,
      entityId,
      status: FraudAlertStatus.OPEN,
    });

    return this.fraudAlertRepository.save(alert);
  }

  async getFraudAlerts(pagination: { page: number; limit: number }): Promise<PaginatedResult<FraudAlert>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.fraudAlertRepository.findAndCount({
      skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async resolveFlag(flagId: string, moderatorId: string, dto: ResolveAlertDto): Promise<FraudAlert> {
    const alert = await this.fraudAlertRepository.findOne({ where: { id: flagId } });
    if (!alert) throw new Error('Fraud alert not found');

    alert.status = dto.status;
    alert.resolution = dto.resolution;
    alert.resolvedById = moderatorId;
    alert.resolvedAt = new Date();
    return this.fraudAlertRepository.save(alert);
  }

  async getFraudAlert(id: string): Promise<FraudAlert> {
    const alert = await this.fraudAlertRepository.findOne({ where: { id } });
    if (!alert) throw new Error('Fraud alert not found');
    return alert;
  }

  async analyzeListingById(listingId: string): Promise<any> {
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) throw new Error('Listing not found');
    return { listingId, riskScore: listing.fraudRiskScore, isFlagged: listing.status === ListingStatus.FLAGGED };
  }

  async analyzeUserById(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    const alerts = await this.fraudAlertRepository.find({ where: { targetUserId: userId } });
    return { userId, trustScore: user.trustScore, alerts };
  }
}
