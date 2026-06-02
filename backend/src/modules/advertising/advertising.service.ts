import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import { Advertisement, AdStatus, AdType } from './entities/advertisement.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class AdvertisingService {
  private readonly logger = new LoggerService('AdvertisingService');

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
    @InjectRepository(Advertisement)
    private readonly adRepository: Repository<Advertisement>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  // ---- CAMPAIGNS ----

  async createCampaign(dto: CreateCampaignDto, userId: string): Promise<Campaign> {
    try {
      const campaign = this.campaignRepository.create({
        ...dto,
        sellerId: userId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });
      const saved = await this.campaignRepository.save(campaign);

      await this.auditLogRepository.save({
        action: AuditAction.CREATE,
        description: `Campaign created: ${saved.name}`,
        entityType: 'campaign',
        entityId: saved.id,
        userId,
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create campaign', error.stack);
      throw error;
    }
  }

  async updateCampaign(id: string, dto: UpdateCampaignDto, userId: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepository.findOne({ where: { id } });
      if (!campaign) throw new NotFoundException('Campaign not found');
      if (campaign.sellerId !== userId) throw new ForbiddenException('Not your campaign');

      Object.assign(campaign, {
        ...dto,
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      });

      const saved = await this.campaignRepository.save(campaign);

      await this.auditLogRepository.save({
        action: AuditAction.UPDATE,
        description: `Campaign updated: ${saved.name}`,
        entityType: 'campaign',
        entityId: saved.id,
        userId,
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to update campaign ${id}`, error.stack);
      throw error;
    }
  }

  async getCampaign(id: string): Promise<Campaign> {
    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id },
        relations: ['ads'],
      });
      if (!campaign) throw new NotFoundException('Campaign not found');
      return campaign;
    } catch (error) {
      this.logger.error(`Failed to get campaign ${id}`, error.stack);
      throw error;
    }
  }

  async getUserCampaigns(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Campaign>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;
      const [items, total] = await this.campaignRepository.findAndCount({
        where: { sellerId: userId },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Failed to get user campaigns for ${userId}`, error.stack);
      throw error;
    }
  }

  async pauseCampaign(id: string, userId: string): Promise<Campaign> {
    try {
      const campaign = await this.getCampaign(id);
      if (campaign.sellerId !== userId) throw new ForbiddenException('Not your campaign');
      if (campaign.status !== CampaignStatus.ACTIVE) throw new BadRequestException('Campaign is not active');
      campaign.status = CampaignStatus.PAUSED;
      const saved = await this.campaignRepository.save(campaign);

      await this.adRepository.update({ campaignId: id, status: AdStatus.ACTIVE }, { status: AdStatus.PAUSED, isActive: false });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to pause campaign ${id}`, error.stack);
      throw error;
    }
  }

  async resumeCampaign(id: string, userId: string): Promise<Campaign> {
    try {
      const campaign = await this.getCampaign(id);
      if (campaign.sellerId !== userId) throw new ForbiddenException('Not your campaign');
      if (campaign.status !== CampaignStatus.PAUSED) throw new BadRequestException('Campaign is not paused');
      campaign.status = CampaignStatus.ACTIVE;
      const saved = await this.campaignRepository.save(campaign);

      await this.adRepository.update({ campaignId: id, status: AdStatus.PAUSED }, { status: AdStatus.ACTIVE, isActive: true });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to resume campaign ${id}`, error.stack);
      throw error;
    }
  }

  async endCampaign(id: string, userId: string): Promise<Campaign> {
    try {
      const campaign = await this.getCampaign(id);
      if (campaign.sellerId !== userId) throw new ForbiddenException('Not your campaign');
      if (campaign.status === CampaignStatus.ENDED) throw new BadRequestException('Campaign already ended');
      campaign.status = CampaignStatus.ENDED;
      const saved = await this.campaignRepository.save(campaign);

      await this.adRepository.update(
        { campaignId: id },
        { status: AdStatus.ENDED, isActive: false },
      );

      return saved;
    } catch (error) {
      this.logger.error(`Failed to end campaign ${id}`, error.stack);
      throw error;
    }
  }

  // ---- ADS ----

  async createAd(dto: CreateAdDto, userId: string): Promise<Advertisement> {
    try {
      if (dto.campaignId) {
        const campaign = await this.campaignRepository.findOne({ where: { id: dto.campaignId } });
        if (!campaign) throw new NotFoundException('Campaign not found');
        if (campaign.sellerId !== userId) throw new ForbiddenException('Campaign does not belong to you');
      }

      const ad = this.adRepository.create({
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });
      const saved = await this.adRepository.save(ad);

      await this.auditLogRepository.save({
        action: AuditAction.CREATE,
        description: `Ad created: ${saved.title}`,
        entityType: 'advertisement',
        entityId: saved.id,
        userId,
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create ad', error.stack);
      throw error;
    }
  }

  async updateAd(id: string, dto: UpdateAdDto, userId?: string): Promise<Advertisement> {
    try {
      const ad = await this.adRepository.findOne({ where: { id } });
      if (!ad) throw new NotFoundException('Ad not found');

      Object.assign(ad, {
        ...dto,
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      });

      const saved = await this.adRepository.save(ad);

      if (userId) {
        await this.auditLogRepository.save({
          action: AuditAction.UPDATE,
          description: `Ad updated: ${saved.title}`,
          entityType: 'advertisement',
          entityId: saved.id,
          userId,
        });
      }

      return saved;
    } catch (error) {
      this.logger.error(`Failed to update ad ${id}`, error.stack);
      throw error;
    }
  }

  async getAd(id: string): Promise<Advertisement> {
    try {
      const ad = await this.adRepository.findOne({ where: { id } });
      if (!ad) throw new NotFoundException('Ad not found');
      return ad;
    } catch (error) {
      this.logger.error(`Failed to get ad ${id}`, error.stack);
      throw error;
    }
  }

  async getAds(campaignId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Advertisement>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;
      const [items, total] = await this.adRepository.findAndCount({
        where: { campaignId },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Failed to get ads for campaign ${campaignId}`, error.stack);
      throw error;
    }
  }

  async deleteAd(id: string, userId: string): Promise<void> {
    try {
      const ad = await this.getAd(id);
      if (ad.sellerId !== userId) throw new ForbiddenException('Not your ad');

      await this.adRepository.softDelete ? await this.adRepository.softDelete(id) : await this.adRepository.delete(id);

      await this.auditLogRepository.save({
        action: AuditAction.DELETE,
        description: `Ad deleted: ${ad.title}`,
        entityType: 'advertisement',
        entityId: id,
        userId,
      });
    } catch (error) {
      this.logger.error(`Failed to delete ad ${id}`, error.stack);
      throw error;
    }
  }

  // ---- TRACKING ----

  async recordImpression(adId: string): Promise<void> {
    try {
      const ad = await this.getAd(adId);
      ad.impressions += 1;
      ad.ctr = this.calculateCTR(ad);
      if (ad.campaignId) {
        await this.campaignRepository.increment({ id: ad.campaignId }, 'totalImpressions', 1);
      }
      await this.adRepository.save(ad);
    } catch (error) {
      this.logger.error(`Failed to record impression for ad ${adId}`, error.stack);
    }
  }

  async recordClick(adId: string): Promise<void> {
    try {
      const ad = await this.getAd(adId);
      ad.clicks += 1;
      ad.ctr = this.calculateCTR(ad);
      if (ad.campaignId) {
        await this.campaignRepository.increment({ id: ad.campaignId }, 'totalClicks', 1);
      }
      await this.adRepository.save(ad);
    } catch (error) {
      this.logger.error(`Failed to record click for ad ${adId}`, error.stack);
    }
  }

  async recordConversion(adId: string): Promise<void> {
    try {
      const ad = await this.getAd(adId);
      ad.conversionRate = ad.impressions > 0
        ? ((ad.conversionRate * ad.impressions + 1) / (ad.impressions + 1))
        : 0.01;
      if (ad.campaignId) {
        await this.campaignRepository.increment({ id: ad.campaignId }, 'totalConversions', 1);
      }
      await this.adRepository.save(ad);
    } catch (error) {
      this.logger.error(`Failed to record conversion for ad ${adId}`, error.stack);
    }
  }

  // ---- ANALYTICS ----

  async getAdAnalytics(adId: string): Promise<{
    impressions: number;
    clicks: number;
    ctr: number;
    spend: number;
    conversions: number;
    conversionRate: number;
  }> {
    try {
      const ad = await this.getAd(adId);
      return {
        impressions: ad.impressions,
        clicks: ad.clicks,
        ctr: ad.ctr,
        spend: Number(ad.spent),
        conversions: 0,
        conversionRate: ad.conversionRate,
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics for ad ${adId}`, error.stack);
      throw error;
    }
  }

  async getCampaignAnalytics(campaignId: string): Promise<{
    campaign: Campaign;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpent: number;
    budget: number;
    remaining: number;
    clickThroughRate: number;
    conversionRate: number;
    ads: Advertisement[];
  }> {
    try {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
        relations: ['ads'],
      });
      if (!campaign) throw new NotFoundException('Campaign not found');

      const ads = campaign.ads || [];
      const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0);
      const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
      const totalConversions = ads.reduce((s, a) => s + (a.conversionRate > 0 ? 1 : 0), 0);
      const totalSpent = ads.reduce((s, a) => s + Number(a.spent), 0);

      return {
        campaign,
        totalImpressions,
        totalClicks,
        totalConversions,
        totalSpent,
        budget: Number(campaign.budget),
        remaining: Number(campaign.budget) - totalSpent,
        clickThroughRate: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
        conversionRate: totalClicks > 0 ? totalConversions / totalClicks : 0,
        ads,
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics for campaign ${campaignId}`, error.stack);
      throw error;
    }
  }

  // ---- PLACEMENT ----

  async getPlacementAds(placement: string, filters?: { type?: AdType; limit?: number }): Promise<Advertisement[]> {
    try {
      const where: any = {
        placement,
        status: AdStatus.ACTIVE,
        isActive: true,
        startDate: LessThanOrEqual(new Date()),
        endDate: MoreThanOrEqual(new Date()),
      };
      if (filters?.type) where.type = filters.type;

      return this.adRepository.find({
        where,
        take: filters?.limit || 10,
        order: { bidAmount: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get placement ads for ${placement}`, error.stack);
      throw error;
    }
  }

  async getAvailablePlacements(): Promise<string[]> {
    return ['homepage-banner', 'homepage-sidebar', 'search-top', 'search-bottom', 'category-top', 'listing-featured', 'mobile-banner', 'footer-banner'];
  }

  // ---- BID OPTIMIZATION ----

  async optimizeBid(adId: string): Promise<{ currentBid: number; suggestedBid: number; reason: string }> {
    try {
      const ad = await this.getAd(adId);
      const currentBid = Number(ad.bidAmount) || 0;

      const placementAds = await this.adRepository.find({
        where: { placement: ad.placement, status: AdStatus.ACTIVE, isActive: true },
        order: { bidAmount: 'DESC' },
        take: 10,
      });

      const avgBid = placementAds.length > 0
        ? placementAds.reduce((s, a) => s + Number(a.bidAmount || 0), 0) / placementAds.length
        : currentBid;

      const ctr = ad.ctr || 0;
      let suggestedBid = currentBid;
      let reason = '';

      if (ctr < 0.01 && currentBid > avgBid * 0.5) {
        suggestedBid = currentBid * 0.9;
        reason = 'Low CTR, reducing bid to optimize spend';
      } else if (ctr > 0.05 && currentBid < avgBid) {
        suggestedBid = avgBid;
        reason = 'High CTR, increasing bid to capture more impressions';
      } else if (currentBid === 0) {
        suggestedBid = avgBid * 0.8;
        reason = 'Setting initial bid based on placement average';
      } else {
        suggestedBid = currentBid;
        reason = 'Current bid is optimal';
      }

      if (ad.autoOptimize && suggestedBid !== currentBid) {
        ad.bidAmount = suggestedBid;
        await this.adRepository.save(ad);
      }

      return { currentBid, suggestedBid, reason };
    } catch (error) {
      this.logger.error(`Failed to optimize bid for ad ${adId}`, error.stack);
      throw error;
    }
  }

  calculateCTR(ad: Advertisement): number {
    if (ad.impressions === 0) return 0;
    return ad.clicks / ad.impressions;
  }
}
