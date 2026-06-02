import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { LoyaltyPoints, PointsType, PointsReferenceType } from './entities/loyalty-points.entity';
import { LoyaltyReward, RewardType } from './entities/loyalty-reward.entity';
import { UserLoyalty, LoyaltyTier } from './entities/user-loyalty.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

interface TierConfig {
  minPoints: number;
  label: string;
  benefits: string[];
}

const TIER_CONFIGS: Record<LoyaltyTier, TierConfig> = {
  [LoyaltyTier.BRONZE]: { minPoints: 0, label: 'Bronze', benefits: ['Basic support', 'Standard fees'] },
  [LoyaltyTier.SILVER]: { minPoints: 100, label: 'Silver', benefits: ['Priority support', '5% fee discount', 'Early access'] },
  [LoyaltyTier.GOLD]: { minPoints: 500, label: 'Gold', benefits: ['Priority support', '10% fee discount', 'Early access', 'Featured listings'] },
  [LoyaltyTier.PLATINUM]: { minPoints: 2000, label: 'Platinum', benefits: ['VIP support', '15% fee discount', 'Early access', 'Featured listings', 'Dedicated manager'] },
  [LoyaltyTier.VIP]: { minPoints: 10000, label: 'VIP', benefits: ['VIP support', '20% fee discount', 'Early access', 'Featured listings', 'Dedicated manager', 'Custom branding'] },
};

@Injectable()
export class LoyaltyService {
  private readonly logger = new LoggerService('LoyaltyService');

  constructor(
    @InjectRepository(LoyaltyPoints)
    private readonly pointsRepository: Repository<LoyaltyPoints>,
    @InjectRepository(LoyaltyReward)
    private readonly rewardRepository: Repository<LoyaltyReward>,
    @InjectRepository(UserLoyalty)
    private readonly userLoyaltyRepository: Repository<UserLoyalty>,
  ) {}

  private async ensureUserLoyalty(userId: string): Promise<UserLoyalty> {
    let record = await this.userLoyaltyRepository.findOne({ where: { userId } });
    if (!record) {
      record = this.userLoyaltyRepository.create({
        userId,
        totalPoints: 0,
        lifetimePoints: 0,
        currentTier: LoyaltyTier.BRONZE,
        referralCode: await this.generateReferralCode(userId),
      });
      record = await this.userLoyaltyRepository.save(record);
    }
    return record;
  }

  async earnPoints(userId: string, points: number, reason: string, referenceType: PointsReferenceType, referenceId?: string): Promise<LoyaltyPoints> {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const entry = this.pointsRepository.create({
      userId,
      points,
      reason,
      type: PointsType.EARNED,
      referenceType,
      referenceId: referenceId || null,
      expiresAt,
    });

    const saved = await this.pointsRepository.save(entry);

    const loyalty = await this.ensureUserLoyalty(userId);
    loyalty.totalPoints += points;
    loyalty.lifetimePoints += points;
    loyalty.currentTier = this.calculateTier(loyalty.lifetimePoints);
    loyalty.nextTierPoints = this.getNextTierPoints(loyalty.lifetimePoints);
    loyalty.tierProgress = this.calculateTierProgress(loyalty.lifetimePoints);
    await this.userLoyaltyRepository.save(loyalty);

    this.logger.log(`User ${userId} earned ${points} points: ${reason}`);
    return saved;
  }

  async spendPoints(userId: string, points: number, rewardId?: string): Promise<LoyaltyPoints> {
    const loyalty = await this.ensureUserLoyalty(userId);
    if (loyalty.totalPoints < points) {
      throw new BadRequestException('Insufficient points');
    }

    if (rewardId) {
      const reward = await this.rewardRepository.findOne({ where: { id: rewardId, isActive: true } });
      if (!reward) throw new NotFoundException('Reward not found');
      if (reward.stock !== null && reward.stock <= 0) {
        throw new BadRequestException('Reward out of stock');
      }
    }

    const entry = this.pointsRepository.create({
      userId,
      points: -points,
      reason: rewardId ? `Redeemed reward: ${rewardId}` : 'Manual spend',
      type: PointsType.SPENT,
      referenceType: PointsReferenceType.REWARD,
      referenceId: rewardId || null,
    });

    const saved = await this.pointsRepository.save(entry);

    loyalty.totalPoints -= points;
    await this.userLoyaltyRepository.save(loyalty);

    if (rewardId) {
      const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });
      if (reward && reward.stock !== null) {
        reward.stock -= 1;
        await this.rewardRepository.save(reward);
      }
    }

    this.logger.log(`User ${userId} spent ${points} points`);
    return saved;
  }

  async getPointsBalance(userId: string): Promise<{ totalPoints: number; lifetimePoints: number; currentTier: LoyaltyTier }> {
    const loyalty = await this.ensureUserLoyalty(userId);
    return {
      totalPoints: loyalty.totalPoints,
      lifetimePoints: loyalty.lifetimePoints,
      currentTier: loyalty.currentTier,
    };
  }

  async getPointsHistory(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<LoyaltyPoints>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.pointsRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getRewards(): Promise<LoyaltyReward[]> {
    return this.rewardRepository.find({
      where: { isActive: true },
      order: { pointsCost: 'ASC' },
    });
  }

  async createReward(dto: Partial<LoyaltyReward>, adminId: string): Promise<LoyaltyReward> {
    const reward = this.rewardRepository.create(dto);
    const saved = await this.rewardRepository.save(reward);
    this.logger.log(`Reward created: ${saved.id} by admin ${adminId}`);
    return saved;
  }

  async updateReward(id: string, dto: Partial<LoyaltyReward>, adminId: string): Promise<LoyaltyReward> {
    const reward = await this.rewardRepository.findOne({ where: { id } });
    if (!reward) throw new NotFoundException('Reward not found');
    Object.assign(reward, dto);
    const saved = await this.rewardRepository.save(reward);
    this.logger.log(`Reward ${id} updated by admin ${adminId}`);
    return saved;
  }

  async redeemReward(userId: string, rewardId: string): Promise<LoyaltyPoints> {
    const reward = await this.rewardRepository.findOne({ where: { id: rewardId, isActive: true } });
    if (!reward) throw new NotFoundException('Reward not found or inactive');
    if (reward.stock !== null && reward.stock <= 0) {
      throw new BadRequestException('Reward out of stock');
    }
    return this.spendPoints(userId, reward.pointsCost, rewardId);
  }

  calculateTier(totalPoints: number): LoyaltyTier {
    const tiers = Object.entries(TIER_CONFIGS) as [LoyaltyTier, TierConfig][];
    let currentTier = LoyaltyTier.BRONZE;
    for (const [tier, config] of tiers) {
      if (totalPoints >= config.minPoints) {
        currentTier = tier;
      }
    }
    return currentTier;
  }

  getNextTierPoints(totalPoints: number): number {
    const tiers = Object.entries(TIER_CONFIGS) as [LoyaltyTier, TierConfig][];
    for (const [, config] of tiers) {
      if (totalPoints < config.minPoints) {
        return config.minPoints;
      }
    }
    return TIER_CONFIGS[LoyaltyTier.VIP].minPoints;
  }

  calculateTierProgress(totalPoints: number): number {
    const tiers = Object.entries(TIER_CONFIGS) as [LoyaltyTier, TierConfig][];
    for (let i = 0; i < tiers.length - 1; i++) {
      const currentMin = tiers[i][1].minPoints;
      const nextMin = tiers[i + 1][1].minPoints;
      if (totalPoints >= currentMin && totalPoints < nextMin) {
        return Math.round(((totalPoints - currentMin) / (nextMin - currentMin)) * 100);
      }
    }
    return 100;
  }

  getTierBenefits(tier: LoyaltyTier): string[] {
    return TIER_CONFIGS[tier]?.benefits || TIER_CONFIGS[LoyaltyTier.BRONZE].benefits;
  }

  async getLeaderboard(limit: number = 20): Promise<UserLoyalty[]> {
    return this.userLoyaltyRepository.find({
      order: { lifetimePoints: 'DESC' },
      take: Math.min(limit, 100),
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expirePoints(): Promise<void> {
    const now = new Date();
    const expired = await this.pointsRepository.find({
      where: {
        type: PointsType.EARNED,
        expiresAt: LessThan(now) as any,
      },
    });

    for (const entry of expired) {
      const expiryRecord = this.pointsRepository.create({
        userId: entry.userId,
        points: -entry.points,
        reason: 'Points expired',
        type: PointsType.EXPIRED,
        referenceType: PointsReferenceType.BONUS,
      });
      await this.pointsRepository.save(expiryRecord);

      const loyalty = await this.ensureUserLoyalty(entry.userId);
      loyalty.totalPoints = Math.max(0, loyalty.totalPoints - entry.points);
      await this.userLoyaltyRepository.save(loyalty);
    }

    if (expired.length > 0) {
      this.logger.log(`${expired.length} point records expired`);
    }
  }

  async generateReferralCode(userId: string): Promise<string> {
    const hash = crypto.createHash('sha256').update(userId + Date.now().toString()).digest('hex');
    const code = hash.substring(0, 8).toUpperCase();
    const existing = await this.userLoyaltyRepository.findOne({ where: { referralCode: code } });
    if (existing) return this.generateReferralCode(userId + '1');
    return code;
  }

  async processReferral(referrerCode: string, newUserId: string): Promise<void> {
    const referrer = await this.userLoyaltyRepository.findOne({ where: { referralCode: referrerCode } });
    if (!referrer) throw new NotFoundException('Invalid referral code');
    if (referrer.userId === newUserId) throw new BadRequestException('Cannot refer yourself');

    referrer.referralCount += 1;
    await this.userLoyaltyRepository.save(referrer);

    await this.earnPoints(referrer.userId, 50, 'New user referral', PointsReferenceType.REFERRAL, newUserId);
    await this.earnPoints(newUserId, 25, 'Signup bonus from referral', PointsReferenceType.REFERRAL, referrer.userId);

    this.logger.log(`Referral processed: ${referrerCode} -> ${newUserId}`);
  }

  async getLoyaltyProfile(userId: string): Promise<UserLoyalty> {
    return this.ensureUserLoyalty(userId);
  }
}
