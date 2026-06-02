import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketInsight, InsightType, InsightPeriod } from './entities/market-insight.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class MarketIntelligenceService {
  private readonly logger = new LoggerService('MarketIntelligenceService');

  constructor(
    @InjectRepository(MarketInsight)
    private readonly insightRepository: Repository<MarketInsight>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generateInsights(): Promise<void> {
    this.logger.log('Starting daily insight generation');

    try {
      await this.generateDemandInsights();
      await this.generatePriceInsights();
      await this.generateTrendInsights();
      await this.generateRegionalInsights();
      this.logger.log('Daily insights generated successfully');
    } catch (err) {
      this.logger.error(`Failed to generate insights: ${err.message}`);
    }
  }

  private async generateDemandInsights(): Promise<void> {
    const brands = await this.listingRepository
      .createQueryBuilder('listing')
      .select('listing.brand', 'brand')
      .addSelect('COUNT(listing.id)', 'listingCount')
      .addSelect('SUM(listing.viewCount)', 'totalViews')
      .addSelect('AVG(listing.watchCount)', 'avgWatch')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE })
      .andWhere('listing.brand IS NOT NULL')
      .groupBy('listing.brand')
      .getRawMany();

    for (const brand of brands) {
      try {
        const demandScore = Math.min(100, Math.round(
          (parseInt(brand.totalViews || '0', 10) * 0.6 +
            parseInt(brand.avgWatch || '0', 10) * 0.4) / Math.max(1, parseInt(brand.listingCount, 10)),
        ));

        const insight = this.insightRepository.create({
          type: InsightType.DEMAND,
          category: 'brand_demand',
          brand: brand.brand,
          data: {
            brand: brand.brand,
            listingCount: parseInt(brand.listingCount, 10),
            totalViews: parseInt(brand.totalViews || '0', 10),
            avgWatch: parseFloat(brand.avgWatch || '0'),
          },
          score: demandScore,
          period: InsightPeriod.DAILY,
          generatedAt: new Date(),
        });

        await this.insightRepository.save(insight);
      } catch (err) {
        this.logger.warn(`Failed to generate demand insight for brand ${brand.brand}: ${err.message}`);
      }
    }
  }

  private async generatePriceInsights(): Promise<void> {
    const categories = await this.listingRepository
      .createQueryBuilder('listing')
      .select('listing.brand', 'brand')
      .addSelect('listing.model', 'model')
      .addSelect('AVG(listing.price)', 'avgPrice')
      .addSelect('MIN(listing.price)', 'minPrice')
      .addSelect('MAX(listing.price)', 'maxPrice')
      .addSelect('COUNT(listing.id)', 'count')
      .addSelect('STDDEV(listing.price)', 'priceStdDev')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE })
      .andWhere('listing.brand IS NOT NULL')
      .andWhere('listing.model IS NOT NULL')
      .groupBy('listing.brand')
      .addGroupBy('listing.model')
      .getRawMany();

    for (const cat of categories) {
      try {
        const count = parseInt(cat.count, 10);
        if (count < 3) continue;

        const insight = this.insightRepository.create({
          type: InsightType.PRICE,
          category: 'device_pricing',
          brand: cat.brand,
          model: cat.model,
          data: {
            brand: cat.brand,
            model: cat.model,
            avgPrice: parseFloat(cat.avgPrice || '0'),
            minPrice: parseFloat(cat.minPrice || '0'),
            maxPrice: parseFloat(cat.maxPrice || '0'),
            count,
            priceStdDev: parseFloat(cat.priceStdDev || '0'),
            volatility: count > 10 ? 'low' : 'medium',
          },
          score: Math.min(100, count * 10),
          period: InsightPeriod.DAILY,
          generatedAt: new Date(),
        });

        await this.insightRepository.save(insight);
      } catch (err) {
        this.logger.warn(`Failed to generate price insight for ${cat.brand} ${cat.model}: ${err.message}`);
      }
    }
  }

  private async generateTrendInsights(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBrands = await this.listingRepository
      .createQueryBuilder('listing')
      .select('listing.brand', 'brand')
      .addSelect('COUNT(listing.id)', 'count')
      .addSelect('SUM(listing.viewCount)', 'views')
      .where('listing.createdAt >= :since', { since: sevenDaysAgo })
      .andWhere('listing.brand IS NOT NULL')
      .groupBy('listing.brand')
      .orderBy('COUNT(listing.id)', 'DESC')
      .limit(20)
      .getRawMany();

    for (const brand of recentBrands) {
      try {
        const trendScore = Math.min(100, Math.round(
          (parseInt(brand.count, 10) * 0.5 + parseInt(brand.views || '0', 10) * 0.5) / 10,
        ));

        const insight = this.insightRepository.create({
          type: InsightType.TREND,
          category: 'trending_brands',
          brand: brand.brand,
          data: {
            brand: brand.brand,
            newListings: parseInt(brand.count, 10),
            totalViews: parseInt(brand.views || '0', 10),
          },
          score: trendScore,
          period: InsightPeriod.WEEKLY,
          generatedAt: new Date(),
        });

        await this.insightRepository.save(insight);
      } catch (err) {
        this.logger.warn(`Failed to generate trend insight for ${brand.brand}: ${err.message}`);
      }
    }
  }

  private async generateRegionalInsights(): Promise<void> {
    const regional = await this.listingRepository
      .createQueryBuilder('listing')
      .select('listing.country', 'country')
      .addSelect('listing.city', 'city')
      .addSelect('COUNT(listing.id)', 'count')
      .addSelect('AVG(listing.price)', 'avgPrice')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE })
      .andWhere('listing.country IS NOT NULL')
      .groupBy('listing.country')
      .addGroupBy('listing.city')
      .orderBy('COUNT(listing.id)', 'DESC')
      .limit(50)
      .getRawMany();

    for (const region of regional) {
      try {
        if (parseInt(region.count, 10) < 3) continue;

        const insight = this.insightRepository.create({
          type: InsightType.REGIONAL,
          category: 'regional_distribution',
          data: {
            country: region.country,
            city: region.city,
            listingCount: parseInt(region.count, 10),
            avgPrice: parseFloat(region.avgPrice || '0'),
          },
          score: Math.min(100, parseInt(region.count, 10) * 5),
          period: InsightPeriod.DAILY,
          generatedAt: new Date(),
        });

        await this.insightRepository.save(insight);
      } catch (err) {
        this.logger.warn(`Failed to generate regional insight: ${err.message}`);
      }
    }
  }

  async getDeviceDemand(brand?: string, model?: string): Promise<any> {
    const where: any = { type: InsightType.DEMAND };
    if (brand) where.brand = brand;
    if (model) where.model = model;

    const insights = await this.insightRepository.find({
      where,
      order: { generatedAt: 'DESC' },
      take: 20,
    });

    const latest = insights[0];

    return {
      brand,
      model: model || 'all',
      demandScore: latest?.score || 50,
      demandLevel: latest?.score >= 70 ? 'high' : latest?.score >= 40 ? 'medium' : 'low',
      insights: insights.slice(0, 10).map((i) => ({
        score: i.score,
        data: i.data,
        generatedAt: i.generatedAt,
      })),
      summary: brand
        ? `${brand}${model ? ` ${model}` : ''} has ${latest?.score >= 70 ? 'high' : latest?.score >= 40 ? 'moderate' : 'low'} demand`
        : 'Overall market demand analysis',
    };
  }

  async getPriceTrends(brand?: string, model?: string): Promise<any> {
    const where: any = { type: InsightType.PRICE };
    if (brand) where.brand = brand;
    if (model) where.model = model;

    const insights = await this.insightRepository.find({
      where,
      order: { generatedAt: 'DESC' },
      take: 30,
    });

    const grouped = new Map<string, MarketInsight[]>();
    for (const insight of insights) {
      const key = `${insight.brand}-${insight.model}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(insight);
    }

    const trends = Array.from(grouped.entries()).map(([key, entries]) => {
      const [b, m] = key.split('-');
      const avgPrice = entries.length > 0
        ? entries.reduce((s, e) => s + (e.data?.avgPrice || 0), 0) / entries.length
        : 0;
      return { brand: b, model: m, avgPrice, dataPoints: entries.length };
    });

    return {
      brand: brand || 'all',
      model: model || 'all',
      deviceCount: trends.length,
      trends: trends.slice(0, 20),
      generatedAt: new Date(),
    };
  }

  async getTrendingBrands(period: InsightPeriod = InsightPeriod.WEEKLY): Promise<any> {
    const since = new Date();
    if (period === InsightPeriod.DAILY) since.setDate(since.getDate() - 1);
    else if (period === InsightPeriod.WEEKLY) since.setDate(since.getDate() - 7);
    else since.setMonth(since.getMonth() - 1);

    const insights = await this.insightRepository.find({
      where: { type: InsightType.TREND, generatedAt: MoreThanOrEqual(since) },
      order: { score: 'DESC' },
      take: 20,
    });

    return {
      period,
      generatedAt: new Date(),
      brands: insights.map((i) => ({
        brand: i.brand,
        score: i.score,
        data: i.data,
      })),
    };
  }

  async getRegionalTrends(country?: string): Promise<any> {
    const where: any = { type: InsightType.REGIONAL };
    if (country) where['data->country'] = country;

    const insights = await this.insightRepository.find({
      where: { type: InsightType.REGIONAL },
      order: { score: 'DESC' },
      take: 50,
    });

    const filtered = country
      ? insights.filter((i) => i.data?.country === country)
      : insights;

    const grouped = new Map<string, { count: number; avgPrice: number; cities: any[] }>();

    for (const insight of filtered) {
      const countryName = insight.data?.country || 'Unknown';
      if (!grouped.has(countryName)) {
        grouped.set(countryName, { count: 0, avgPrice: 0, cities: [] });
      }
      const group = grouped.get(countryName);
      group.count += insight.data?.listingCount || 0;
      group.avgPrice += (insight.data?.avgPrice || 0) * (insight.data?.listingCount || 0);
      if (insight.data?.city) {
        group.cities.push({
          city: insight.data.city,
          listingCount: insight.data.listingCount,
          avgPrice: insight.data.avgPrice,
        });
      }
    }

    const regions = Array.from(grouped.entries()).map(([name, data]) => ({
      country: name,
      totalListings: data.count,
      avgPrice: data.count > 0 ? Math.round(data.avgPrice / data.count) : 0,
      cities: data.cities.slice(0, 10),
    }));

    return { regions, total: regions.length, generatedAt: new Date() };
  }

  async getUserBehaviorInsights(): Promise<any> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const activeUsers = await this.userRepository.count({
        where: { lastLoginAt: MoreThanOrEqual(sevenDaysAgo) },
      });

      const newListings = await this.listingRepository.count({
        where: { createdAt: MoreThanOrEqual(sevenDaysAgo) },
      });

      const totalListings = await this.listingRepository.count();

      return {
        activeUsers,
        newListingsLast7Days: newListings,
        totalListings,
        engagementRate: totalListings > 0 ? Math.round((activeUsers / totalListings) * 100) : 0,
        period: '7d',
        generatedAt: new Date(),
      };
    } catch (err) {
      this.logger.error(`Failed to get user behavior insights: ${err.message}`);
      return { activeUsers: 0, newListingsLast7Days: 0, totalListings: 0, engagementRate: 0 };
    }
  }

  async getTopSearches(limit = 10, period: InsightPeriod = InsightPeriod.WEEKLY): Promise<any> {
    const since = new Date();
    if (period === InsightPeriod.DAILY) since.setDate(since.getDate() - 1);
    else if (period === InsightPeriod.WEEKLY) since.setDate(since.getDate() - 7);
    else since.setMonth(since.getMonth() - 1);

    try {
      const topBrands = await this.listingRepository
        .createQueryBuilder('listing')
        .select('listing.brand', 'brand')
        .addSelect('COUNT(listing.id)', 'searchCount')
        .addSelect('SUM(listing.viewCount)', 'totalViews')
        .where('listing.createdAt >= :since', { since })
        .andWhere('listing.brand IS NOT NULL')
        .groupBy('listing.brand')
        .orderBy('COUNT(listing.id)', 'DESC')
        .take(limit)
        .getRawMany();

      return {
        period,
        limit,
        generatedAt: new Date(),
        searches: topBrands.map((b, i) => ({
          rank: i + 1,
          term: b.brand,
          count: parseInt(b.searchCount, 10),
          views: parseInt(b.totalViews || '0', 10),
        })),
      };
    } catch (err) {
      this.logger.error(`Failed to get top searches: ${err.message}`);
      return { searches: [] };
    }
  }

  async getDeviceRecommendations(userId: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) return { recommendations: [], userId };

      const userListings = await this.listingRepository.find({
        where: { sellerId: userId, status: ListingStatus.ACTIVE },
        select: ['brand', 'model', 'categoryId'],
        take: 5,
      });

      const brands = [...new Set(userListings.map((l) => l.brand).filter(Boolean))];
      const categories = [...new Set(userListings.map((l) => l.categoryId).filter(Boolean))];

      if (brands.length === 0 && categories.length === 0) {
        const trending = await this.getTrendingBrands();
        return {
          userId,
          recommendations: (trending.brands || []).slice(0, 5).map((b) => ({
            type: 'trending',
            brand: b.brand,
            reason: 'Trending in marketplace',
          })),
        };
      }

      const recommendations: any[] = [];

      for (const brand of brands) {
        const demand = await this.getDeviceDemand(brand);
        recommendations.push({
          type: 'brand_match',
          brand,
          demandScore: demand.demandScore,
          reason: `Based on your ${brand} listings`,
        });
      }

      const trendingBrands = await this.getTrendingBrands();
      for (const tb of (trendingBrands.brands || []).slice(0, 3)) {
        if (!brands.includes(tb.brand)) {
          recommendations.push({
            type: 'trending',
            brand: tb.brand,
            score: tb.score,
            reason: 'Trending in marketplace',
          });
        }
      }

      return { userId, recommendations: recommendations.slice(0, 10) };
    } catch (err) {
      this.logger.error(`Failed to get device recommendations for user ${userId}: ${err.message}`);
      return { recommendations: [], userId };
    }
  }

  async getSellerInsights(sellerId: string): Promise<any> {
    try {
      const sellerListings = await this.listingRepository.find({
        where: { sellerId },
      });

      const activeListings = sellerListings.filter((l) => l.status === ListingStatus.ACTIVE);
      const soldListings = sellerListings.filter((l) => l.status === ListingStatus.SOLD);

      const totalViews = sellerListings.reduce((s, l) => s + l.viewCount, 0);

      const totalRevenue = soldListings.reduce((s, l) => s + Number(l.price), 0);

      const brandBreakdown = new Map<string, number>();
      for (const l of sellerListings) {
        if (l.brand) {
          brandBreakdown.set(l.brand, (brandBreakdown.get(l.brand) || 0) + 1);
        }
      }

      return {
        sellerId,
        totalListings: sellerListings.length,
        activeListings: activeListings.length,
        soldListings: soldListings.length,
        totalViews,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        conversionRate: sellerListings.length > 0
          ? Math.round((soldListings.length / sellerListings.length) * 100)
          : 0,
        topBrands: Array.from(brandBreakdown.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([brand, count]) => ({ brand, count })),
        avgViewsPerListing: sellerListings.length > 0
          ? Math.round(totalViews / sellerListings.length)
          : 0,
      };
    } catch (err) {
      this.logger.error(`Failed to get seller insights for ${sellerId}: ${err.message}`);
      throw err;
    }
  }

  async getCategoryPerformance(category: string): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const listings = await this.listingRepository.find({
        where: { categoryId: category },
        take: 100,
      });

      const active = listings.filter((l) => l.status === ListingStatus.ACTIVE);
      const sold = listings.filter((l) => l.status === ListingStatus.SOLD);

      const avgPrice = active.length > 0
        ? active.reduce((s, l) => s + Number(l.price), 0) / active.length
        : 0;

      const prices = active.map((l) => Number(l.price)).filter((p) => p > 0);
      prices.sort((a, b) => a - b);

      return {
        category,
        totalListings: listings.length,
        activeListings: active.length,
        soldLast30Days: sold.length,
        avgPrice: Math.round(avgPrice * 100) / 100,
        medianPrice: prices.length > 0
          ? prices[Math.floor(prices.length / 2)]
          : 0,
        priceRange: {
          min: prices[0] || 0,
          max: prices[prices.length - 1] || 0,
        },
        totalViews: listings.reduce((s, l) => s + l.viewCount, 0),
        sellThroughRate: listings.length > 0
          ? Math.round((sold.length / listings.length) * 100)
          : 0,
      };
    } catch (err) {
      this.logger.error(`Failed to get category performance for ${category}: ${err.message}`);
      throw err;
    }
  }
}
