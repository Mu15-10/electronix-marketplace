import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Referral, ReferralStatus } from './entities/referral.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class ReferralService {
  private readonly logger = new LoggerService('ReferralService');
  private readonly REFERRAL_REWARD_AMOUNT = 10;

  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
  ) {}

  async createReferralCode(userId: string): Promise<{ code: string }> {
    const hash = crypto.createHash('sha256').update(userId + Date.now().toString()).digest('hex');
    const code = hash.substring(0, 8).toUpperCase();
    this.logger.log(`Referral code generated for user ${userId}: ${code}`);
    return { code };
  }

  async trackReferral(referralCode: string, newUserId: string): Promise<Referral> {
    const existing = await this.referralRepository.findOne({ where: { referredId: newUserId } });
    if (existing) throw new BadRequestException('User has already been referred');

    const referral = this.referralRepository.create({
      referrerId: referralCode,
      referredId: newUserId,
      referralCode,
      status: ReferralStatus.PENDING,
    });

    const saved = await this.referralRepository.save(referral);
    this.logger.log(`Referral tracked: ${referralCode} -> ${newUserId}`);
    return saved;
  }

  async getReferrals(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Referral>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.referralRepository.findAndCount({
      where: { referrerId: userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    convertedReferrals: number;
    pendingReferrals: number;
    rewardedReferrals: number;
    conversionRate: number;
    totalEarnings: number;
  }> {
    const [totalReferrals, convertedReferrals, pendingReferrals, rewardedReferrals] = await Promise.all([
      this.referralRepository.count({ where: { referrerId: userId } }),
      this.referralRepository.count({ where: { referrerId: userId, status: ReferralStatus.CONVERTED } }),
      this.referralRepository.count({ where: { referrerId: userId, status: ReferralStatus.PENDING } }),
      this.referralRepository.count({ where: { referrerId: userId, status: ReferralStatus.REWARDED } }),
    ]);

    const rewarded = await this.referralRepository.find({
      where: { referrerId: userId, status: ReferralStatus.REWARDED },
    });
    const totalEarnings = rewarded.reduce((sum, r) => sum + Number(r.rewardAmount || 0), 0);

    return {
      totalReferrals,
      convertedReferrals,
      pendingReferrals,
      rewardedReferrals,
      conversionRate: totalReferrals > 0 ? Math.round((convertedReferrals / totalReferrals) * 100) : 0,
      totalEarnings,
    };
  }

  async processConversion(referralId: string): Promise<Referral> {
    const referral = await this.referralRepository.findOne({ where: { id: referralId } });
    if (!referral) throw new NotFoundException('Referral not found');
    if (referral.status !== ReferralStatus.PENDING) throw new BadRequestException('Referral is not pending');

    referral.status = ReferralStatus.CONVERTED;
    referral.convertedAt = new Date();
    referral.rewardAmount = this.REFERRAL_REWARD_AMOUNT;

    const saved = await this.referralRepository.save(referral);
    this.logger.log(`Referral ${referralId} converted`);
    return saved;
  }

  async getTopReferrers(limit: number = 20): Promise<{ referrerId: string; referralCount: number; totalEarnings: number }[]> {
    const referrals = await this.referralRepository.find({
      where: { status: ReferralStatus.REWARDED },
    });

    const grouped = referrals.reduce((acc, r) => {
      if (!acc[r.referrerId]) {
        acc[r.referrerId] = { referrerId: r.referrerId, referralCount: 0, totalEarnings: 0 };
      }
      acc[r.referrerId].referralCount += 1;
      acc[r.referrerId].totalEarnings += Number(r.rewardAmount || 0);
      return acc;
    }, {} as Record<string, { referrerId: string; referralCount: number; totalEarnings: number }>);

    return Object.values(grouped)
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, limit);
  }
}
