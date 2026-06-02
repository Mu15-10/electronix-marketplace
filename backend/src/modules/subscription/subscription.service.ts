import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionPlan, PlanInterval } from './entities/subscription-plan.entity';
import { SellerSubscription, SubscriptionStatus } from './entities/seller-subscription.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class SubscriptionService {
  private readonly logger = new LoggerService('SubscriptionService');

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
    @InjectRepository(SellerSubscription)
    private readonly subscriptionRepository: Repository<SellerSubscription>,
  ) {}

  async getPlans(): Promise<SubscriptionPlan[]> {
    return this.planRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async getPlan(planId: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepository.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Subscription plan not found');
    return plan;
  }

  async createPlan(dto: Partial<SubscriptionPlan>, adminId: string): Promise<SubscriptionPlan> {
    const existing = await this.planRepository.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Plan code already exists');

    const plan = this.planRepository.create(dto);
    const saved = await this.planRepository.save(plan);
    this.logger.log(`Plan created: ${saved.id} by admin ${adminId}`);
    return saved;
  }

  async updatePlan(planId: string, dto: Partial<SubscriptionPlan>, adminId: string): Promise<SubscriptionPlan> {
    const plan = await this.getPlan(planId);
    Object.assign(plan, dto);
    const saved = await this.planRepository.save(plan);
    this.logger.log(`Plan updated: ${planId} by admin ${adminId}`);
    return saved;
  }

  async subscribe(sellerId: string, planCode: string, dto: { paymentMethod?: string; paymentReference?: string }): Promise<SellerSubscription> {
    const plan = await this.planRepository.findOne({ where: { code: planCode, isActive: true } });
    if (!plan) throw new NotFoundException('Plan not found or inactive');

    const active = await this.subscriptionRepository.findOne({
      where: { sellerId, status: SubscriptionStatus.ACTIVE },
    });
    if (active) throw new BadRequestException('Already have an active subscription');

    const now = new Date();
    const endDate = new Date(now);
    if (plan.interval === PlanInterval.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = this.subscriptionRepository.create({
      sellerId,
      planId: plan.id,
      planCode: plan.code,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      price: plan.price,
      currency: plan.currency,
      paymentMethod: dto.paymentMethod,
      paymentReference: dto.paymentReference,
    });

    const saved = await this.subscriptionRepository.save(subscription);
    this.logger.log(`Seller ${sellerId} subscribed to ${planCode}`);
    return saved;
  }

  async cancelSubscription(subscriptionId: string, sellerId: string): Promise<SellerSubscription> {
    const sub = await this.subscriptionRepository.findOne({ where: { id: subscriptionId, sellerId } });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (sub.status !== SubscriptionStatus.ACTIVE) throw new BadRequestException('Subscription is not active');

    sub.status = SubscriptionStatus.CANCELLED;
    sub.cancelledAt = new Date();
    sub.autoRenew = false;

    const saved = await this.subscriptionRepository.save(sub);
    this.logger.log(`Subscription ${subscriptionId} cancelled by seller ${sellerId}`);
    return saved;
  }

  async getSubscription(sellerId: string): Promise<SellerSubscription | null> {
    return this.subscriptionRepository.findOne({
      where: [
        { sellerId, status: SubscriptionStatus.ACTIVE },
        { sellerId, status: SubscriptionStatus.TRIAL },
      ],
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSubscriptionHistory(sellerId: string): Promise<SellerSubscription[]> {
    return this.subscriptionRepository.find({
      where: { sellerId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async renewSubscription(subscriptionId: string): Promise<SellerSubscription> {
    const sub = await this.subscriptionRepository.findOne({ where: { id: subscriptionId }, relations: ['plan'] });
    if (!sub) throw new NotFoundException('Subscription not found');
    if (!sub.autoRenew) throw new BadRequestException('Auto-renew is disabled');

    const plan = sub.plan || await this.planRepository.findOne({ where: { id: sub.planId } });
    if (!plan || !plan.isActive) throw new BadRequestException('Plan is no longer active');

    const now = new Date();
    const endDate = new Date(now);
    if (plan.interval === PlanInterval.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    sub.startDate = now;
    sub.endDate = endDate;
    sub.price = plan.price;
    sub.status = SubscriptionStatus.ACTIVE;

    const saved = await this.subscriptionRepository.save(sub);
    this.logger.log(`Subscription ${subscriptionId} renewed`);
    return saved;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpired(): Promise<void> {
    const now = new Date();
    const expired = await this.subscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(now),
      },
    });

    for (const sub of expired) {
      sub.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionRepository.save(sub);
    }

    if (expired.length > 0) {
      this.logger.log(`${expired.length} subscriptions expired`);
    }
  }

  async upgradePlan(sellerId: string, newPlanCode: string): Promise<SellerSubscription> {
    const newPlan = await this.planRepository.findOne({ where: { code: newPlanCode, isActive: true } });
    if (!newPlan) throw new NotFoundException('New plan not found or inactive');

    const current = await this.subscriptionRepository.findOne({
      where: { sellerId, status: SubscriptionStatus.ACTIVE },
      relations: ['plan'],
    });
    if (!current) throw new NotFoundException('No active subscription found');

    const currentPlan = current.plan || await this.planRepository.findOne({ where: { id: current.planId } });
    if (!currentPlan) throw new NotFoundException('Current plan not found');

    if (currentPlan.sortOrder >= newPlan.sortOrder) {
      throw new BadRequestException('New plan must be higher tier than current');
    }

    const now = new Date();
    const endDate = new Date(now);
    if (newPlan.interval === PlanInterval.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    current.planId = newPlan.id;
    current.planCode = newPlan.code;
    current.startDate = now;
    current.endDate = endDate;
    current.price = newPlan.price;
    current.currency = newPlan.currency;

    const updated = await this.subscriptionRepository.save(current);
    this.logger.log(`Seller ${sellerId} upgraded to ${newPlanCode}`);
    return updated;
  }

  async downgradePlan(sellerId: string, newPlanCode: string): Promise<SellerSubscription> {
    const newPlan = await this.planRepository.findOne({ where: { code: newPlanCode, isActive: true } });
    if (!newPlan) throw new NotFoundException('New plan not found or inactive');

    const current = await this.subscriptionRepository.findOne({
      where: { sellerId, status: SubscriptionStatus.ACTIVE },
      relations: ['plan'],
    });
    if (!current) throw new NotFoundException('No active subscription found');

    const currentPlan = current.plan || await this.planRepository.findOne({ where: { id: current.planId } });
    if (!currentPlan) throw new NotFoundException('Current plan not found');

    if (currentPlan.sortOrder <= newPlan.sortOrder) {
      throw new BadRequestException('New plan must be lower tier than current');
    }

    const now = new Date();
    const endDate = new Date(now);
    if (newPlan.interval === PlanInterval.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    current.planId = newPlan.id;
    current.planCode = newPlan.code;
    current.startDate = now;
    current.endDate = endDate;
    current.price = newPlan.price;
    current.currency = newPlan.currency;

    const saved = await this.subscriptionRepository.save(current);
    this.logger.log(`Seller ${sellerId} downgraded to ${newPlanCode}`);
    return saved;
  }
}
