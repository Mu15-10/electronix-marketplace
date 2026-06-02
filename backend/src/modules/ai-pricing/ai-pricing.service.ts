import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PriceAnalysis } from './entities/price-analysis.entity';
import { Listing } from '../listings/entities/listing.entity';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class AiPricingService {
  private readonly logger = new LoggerService('AiPricingService');

  constructor(
    @InjectRepository(PriceAnalysis)
    private readonly analysisRepository: Repository<PriceAnalysis>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async analyzePrice(listingId: string): Promise<PriceAnalysis> {
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (!listing.brand || !listing.model) throw new BadRequestException('Listing must have brand and model');

    const marketData = await this.getMarketPrices(listing.brand, listing.model, listing.variant);
    const condition = listing.condition;

    const recommendedPrice = this.calculateRecommendedPrice(marketData, condition);
    const confidence = this.calculateConfidence(marketData, condition);
    const demandScore = await this.calculateDemandScore(listing.brand, listing.model);
    const supplyScore = await this.calculateSupplyScore(listing.brand, listing.model);
    const seasonality = await this.getSeasonalTrends(listing.brand, listing.model);

    const analysis = this.analysisRepository.create({
      listingId,
      deviceBrand: listing.brand,
      deviceModel: listing.model,
      deviceVariant: listing.variant,
      condition,
      recommendedPrice,
      minPrice: marketData.minPrice,
      maxPrice: marketData.maxPrice,
      confidence,
      marketAvgPrice: marketData.avgPrice,
      marketMinPrice: marketData.minPrice,
      marketMaxPrice: marketData.maxPrice,
      demandScore,
      supplyScore,
      seasonality,
      priceHistory: marketData.history,
      analysisDate: new Date(),
    });

    const saved = await this.analysisRepository.save(analysis);
    this.logger.log(`Price analysis completed for listing ${listingId}: $${recommendedPrice}`);
    return saved;
  }

  async getRecommendedPrice(
    brand: string,
    model: string,
    variant?: string,
    condition?: string,
  ): Promise<{
    recommendedPrice: number;
    minPrice: number;
    maxPrice: number;
    confidence: number;
    marketAvgPrice: number;
  }> {
    const marketData = await this.getMarketPrices(brand, model, variant);
    const recommendedPrice = this.calculateRecommendedPrice(marketData, condition);
    const confidence = this.calculateConfidence(marketData, condition);

    return {
      recommendedPrice,
      minPrice: marketData.minPrice,
      maxPrice: marketData.maxPrice,
      confidence,
      marketAvgPrice: marketData.avgPrice,
    };
  }

  async getMarketAnalysis(brand: string, model: string): Promise<{
    brand: string;
    model: string;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    demandScore: number;
    supplyScore: number;
    totalListings: number;
    seasonality: Record<string, any>;
    trend: 'rising' | 'falling' | 'stable';
  }> {
    const marketData = await this.getMarketPrices(brand, model);
    const demandScore = await this.calculateDemandScore(brand, model);
    const supplyScore = await this.calculateSupplyScore(brand, model);
    const seasonality = await this.getSeasonalTrends(brand, model);

    const recentAnalyses = await this.analysisRepository.find({
      where: { deviceBrand: brand, deviceModel: model },
      order: { analysisDate: 'DESC' },
      take: 30,
    });

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (recentAnalyses.length >= 2) {
      const firstHalf = recentAnalyses.slice(recentAnalyses.length / 2);
      const secondHalf = recentAnalyses.slice(0, recentAnalyses.length / 2);
      const firstAvg = firstHalf.reduce((s, a) => s + Number(a.marketAvgPrice), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, a) => s + Number(a.marketAvgPrice), 0) / secondHalf.length;
      const diff = secondAvg - firstAvg;
      if (diff > 5) trend = 'rising';
      else if (diff < -5) trend = 'falling';
    }

    return {
      brand,
      model,
      avgPrice: marketData.avgPrice,
      minPrice: marketData.minPrice,
      maxPrice: marketData.maxPrice,
      demandScore,
      supplyScore,
      totalListings: marketData.totalListings,
      seasonality,
      trend,
    };
  }

  async getPriceHistory(brand: string, model: string, days = 30): Promise<{ date: string; avgPrice: number; minPrice: number; maxPrice: number; volume: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const analyses = await this.analysisRepository.find({
      where: {
        deviceBrand: brand,
        deviceModel: model,
        analysisDate: MoreThanOrEqual(since),
      },
      order: { analysisDate: 'ASC' },
    });

    const grouped = new Map<string, { prices: number[]; mins: number[]; maxes: number[]; count: number }>();

    for (const a of analyses) {
      const dateKey = a.analysisDate.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { prices: [], mins: [], maxes: [], count: 0 });
      }
      const group = grouped.get(dateKey);
      group.prices.push(Number(a.marketAvgPrice));
      group.mins.push(Number(a.marketMinPrice));
      group.maxes.push(Number(a.marketMaxPrice));
      group.count += 1;
    }

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      avgPrice: data.prices.reduce((s, p) => s + p, 0) / data.prices.length,
      minPrice: Math.min(...data.mins),
      maxPrice: Math.max(...data.maxes),
      volume: data.count,
    }));
  }

  async calculateDemandScore(brand: string, model: string): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const recentViews = await this.listingRepository
        .createQueryBuilder('listing')
        .select('SUM(listing.viewCount)', 'views')
        .addSelect('COUNT(listing.id)', 'count')
        .where('listing.brand = :brand', { brand })
        .andWhere('listing.model = :model', { model })
        .andWhere('listing.createdAt >= :since', { since: thirtyDaysAgo })
        .getRawOne();

      const totalListings = parseInt(recentViews?.count || '0', 10);
      const totalViews = parseInt(recentViews?.views || '0', 10);

      const basescore = 50;
      const viewScore = totalListings > 0 ? Math.min(25, (totalViews / totalListings) * 5) : 0;
      const listingScore = Math.min(25, totalListings * 2);

      return Math.min(100, Math.max(0, basescore + viewScore + listingScore));
    } catch (err) {
      this.logger.warn(`Failed to calculate demand score for ${brand} ${model}: ${err.message}`);
      return 50;
    }
  }

  async calculateSupplyScore(brand: string, model: string): Promise<number> {
    try {
      const activeCount = await this.listingRepository.count({
        where: {
          brand,
          model,
          status: 'active',
        },
      });

      const basescore = 50;
      const supplyScore = Math.min(50, activeCount * 5);

      return Math.min(100, Math.max(0, basescore + supplyScore));
    } catch (err) {
      this.logger.warn(`Failed to calculate supply score for ${brand} ${model}: ${err.message}`);
      return 50;
    }
  }

  async getSeasonalTrends(brand: string, model: string): Promise<Record<string, any>> {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    try {
      const monthlyData = await this.listingRepository
        .createQueryBuilder('listing')
        .select("TO_CHAR(listing.createdAt, 'Mon')", 'month')
        .addSelect('EXTRACT(MONTH FROM listing.createdAt)', 'monthNum')
        .addSelect('COUNT(listing.id)', 'count')
        .addSelect('AVG(listing.price)', 'avgPrice')
        .where('listing.brand = :brand', { brand })
        .andWhere('listing.model = :model', { model })
        .groupBy('month')
        .addGroupBy('monthNum')
        .orderBy('monthNum', 'ASC')
        .getRawMany();

      return {
        monthlyDistribution: monthlyData.map((d) => ({
          month: d.month,
          count: parseInt(d.count, 10),
          avgPrice: parseFloat(d.avgPrice || '0'),
        })),
        peakMonth: monthlyData.reduce((max, d) => (parseInt(d.count, 10) > parseInt(max?.count || '0', 10) ? d : max), monthlyData[0])?.month || null,
        isPeakSeason: monthlyData.some(
          (d) => parseInt(d.count, 10) > (monthlyData.reduce((s, m) => s + parseInt(m.count, 10), 0) / monthlyData.length) * 1.5,
        ),
      };
    } catch (err) {
      this.logger.warn(`Failed to get seasonal trends for ${brand} ${model}: ${err.message}`);
      return { monthlyDistribution: [], peakMonth: null, isPeakSeason: false };
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateMarketData(): Promise<void> {
    this.logger.log('Starting daily market data refresh');

    try {
      const brands = await this.listingRepository
        .createQueryBuilder('listing')
        .select('listing.brand', 'brand')
        .addSelect('listing.model', 'model')
        .where('listing.brand IS NOT NULL')
        .andWhere('listing.model IS NOT NULL')
        .groupBy('listing.brand')
        .addGroupBy('listing.model')
        .getRawMany();

      for (const entry of brands) {
        try {
          await this.getMarketAnalysis(entry.brand, entry.model);
        } catch (err) {
          this.logger.warn(`Failed to update market data for ${entry.brand} ${entry.model}: ${err.message}`);
        }
      }

      this.logger.log(`Market data refreshed for ${brands.length} brand-model combinations`);
    } catch (err) {
      this.logger.error(`Failed to refresh market data: ${err.message}`);
    }
  }

  async getPricePrediction(
    brand: string,
    model: string,
    condition?: string,
  ): Promise<{
    brand: string;
    model: string;
    currentAvgPrice: number;
    predictedPrice30d: number;
    predictedPrice90d: number;
    trend: 'rising' | 'falling' | 'stable';
    confidence: number;
    factors: string[];
  }> {
    const marketData = await this.getMarketPrices(brand, model);
    const history = await this.getPriceHistory(brand, model, 90);
    const demandScore = await this.calculateDemandScore(brand, model);
    const supplyScore = await this.calculateSupplyScore(brand, model);

    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    const factors: string[] = [];

    if (history.length >= 2) {
      const recent = history.slice(-7);
      const older = history.slice(0, 7);
      const recentAvg = recent.reduce((s, h) => s + h.avgPrice, 0) / recent.length;
      const olderAvg = older.reduce((s, h) => s + h.avgPrice, 0) / older.length;
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;

      if (change > 3) trend = 'rising';
      else if (change < -3) trend = 'falling';

      if (change > 0) factors.push(`Price increased ${change.toFixed(1)}% in the last 7 days`);
      else if (change < 0) factors.push(`Price decreased ${Math.abs(change).toFixed(1)}% in the last 7 days`);
    }

    if (demandScore > 70) factors.push('High demand detected');
    if (supplyScore > 70) factors.push('High supply may pressure prices');
    if (demandScore > supplyScore + 20) factors.push('Demand significantly exceeds supply');

    const conditionAdjustment = condition ? this.getConditionMultiplier(condition) : 1;
    const predicted30d = marketData.avgPrice * conditionAdjustment * (trend === 'rising' ? 1.03 : trend === 'falling' ? 0.97 : 1);
    const predicted90d = marketData.avgPrice * conditionAdjustment * (trend === 'rising' ? 1.08 : trend === 'falling' ? 0.92 : 1);

    return {
      brand,
      model,
      currentAvgPrice: marketData.avgPrice,
      predictedPrice30d: Math.round(predicted30d * 100) / 100,
      predictedPrice90d: Math.round(predicted90d * 100) / 100,
      trend,
      confidence: Math.round((0.5 + (history.length / 90) * 0.3 + (demandScore / 100) * 0.2) * 100) / 100,
      factors,
    };
  }

  private async getMarketPrices(
    brand: string,
    model: string,
    variant?: string,
  ): Promise<{
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    totalListings: number;
    history: { date: string; price: number; volume: number }[];
  }> {
    const queryBuilder = this.listingRepository
      .createQueryBuilder('listing')
      .select('AVG(listing.price)', 'avg')
      .addSelect('MIN(listing.price)', 'min')
      .addSelect('MAX(listing.price)', 'max')
      .addSelect('COUNT(listing.id)', 'count')
      .where('listing.brand = :brand', { brand })
      .andWhere('listing.model = :model', { model })
      .andWhere('listing.status = :status', { status: 'active' });

    if (variant) {
      queryBuilder.andWhere('listing.variant = :variant', { variant });
    }

    const result = await queryBuilder.getRawOne();

    const avgPrice = parseFloat(result?.avg || '0');
    const minPrice = parseFloat(result?.min || '0');
    const maxPrice = parseFloat(result?.max || '0');
    const totalListings = parseInt(result?.count || '0', 10);

    const fallbackPrices = this.getFallbackPrices(brand, model);

    return {
      avgPrice: avgPrice || fallbackPrices.avg,
      minPrice: minPrice || fallbackPrices.min,
      maxPrice: maxPrice || fallbackPrices.max,
      totalListings,
      history: [],
    };
  }

  private calculateRecommendedPrice(
    marketData: { avgPrice: number; minPrice: number; maxPrice: number },
    condition?: string,
  ): number {
    const conditionMultiplier = this.getConditionMultiplier(condition);
    const price = marketData.avgPrice * conditionMultiplier;
    return Math.round(price * 100) / 100;
  }

  private calculateConfidence(marketData: { avgPrice: number; totalListings?: number }, condition?: string): number {
    let confidence = 0.5;
    if (marketData.avgPrice > 0) confidence += 0.2;
    if (condition) confidence += 0.1;
    if (marketData.totalListings && marketData.totalListings > 5) confidence += 0.1;
    if (marketData.totalListings && marketData.totalListings > 20) confidence += 0.1;
    return Math.round(Math.min(1, confidence) * 100) / 100;
  }

  private getConditionMultiplier(condition?: string): number {
    const multipliers: Record<string, number> = {
      new: 1.0,
      like_new: 0.95,
      excellent: 0.9,
      good: 0.8,
      fair: 0.65,
      poor: 0.5,
      for_parts: 0.3,
    };
    return condition ? (multipliers[condition] || 0.8) : 0.85;
  }

  private getFallbackPrices(brand: string, model: string): { avg: number; min: number; max: number } {
    const brandPricing: Record<string, Record<string, { avg: number; min: number; max: number }>> = {
      Apple: {
        'iPhone 15 Pro Max': { avg: 1099, min: 899, max: 1599 },
        'iPhone 15 Pro': { avg: 999, min: 799, max: 1499 },
        'iPhone 15': { avg: 799, min: 599, max: 1299 },
        'iPhone 14 Pro Max': { avg: 899, min: 699, max: 1399 },
        'iPhone 14': { avg: 699, min: 499, max: 1099 },
        'MacBook Pro 16': { avg: 2499, min: 1999, max: 3499 },
        'MacBook Pro 14': { avg: 1999, min: 1599, max: 2999 },
        'MacBook Air M3': { avg: 1099, min: 899, max: 1499 },
        'iPad Pro 12.9': { avg: 1099, min: 899, max: 1899 },
      },
      Samsung: {
        'Galaxy S24 Ultra': { avg: 1199, min: 899, max: 1699 },
        'Galaxy S24': { avg: 799, min: 599, max: 1199 },
        'Galaxy S23 Ultra': { avg: 999, min: 749, max: 1499 },
        'Galaxy Tab S9': { avg: 799, min: 599, max: 1199 },
      },
    };

    return brandPricing[brand]?.[model] || { avg: 499, min: 99, max: 999 };
  }
}
