import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { EscrowTransaction, EscrowStatus } from '../escrow/entities/escrow.entity';
import { FraudAlert, FraudAlertStatus } from '../fraud/entities/fraud-alert.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Listing) private readonly listingRepository: Repository<Listing>,
    @InjectRepository(EscrowTransaction) private readonly escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(FraudAlert) private readonly fraudAlertRepository: Repository<FraudAlert>,
  ) {}

  private getDateRange(timeRange: string): { start: Date; end: Date } {
    const end = new Date();
    let start: Date;
    switch (timeRange) {
      case '7d': start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case '1y': start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return { start, end };
  }

  async getSalesAnalytics(timeRange: string): Promise<any> {
    const { start, end } = this.getDateRange(timeRange);
    const transactions = await this.escrowRepository.find({
      where: { createdAt: Between(start, end), status: EscrowStatus.COMPLETED },
    });
    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const totalFees = transactions.reduce((sum, t) => sum + parseFloat(t.platformFee.toString()), 0);
    return { totalTransactions: transactions.length, totalRevenue, totalFees, averageOrderValue: transactions.length > 0 ? totalRevenue / transactions.length : 0, timeRange };
  }

  async getUserAnalytics(timeRange: string): Promise<any> {
    const { start, end } = this.getDateRange(timeRange);
    const newUsers = await this.userRepository.count({ where: { createdAt: Between(start, end) } });
    const totalUsers = await this.userRepository.count();
    return { newUsers, totalUsers, signupGrowth: totalUsers > 0 ? (newUsers / totalUsers) * 100 : 0, timeRange };
  }

  async getListingAnalytics(timeRange: string): Promise<any> {
    const { start, end } = this.getDateRange(timeRange);
    const newListings = await this.listingRepository.count({ where: { createdAt: Between(start, end) } });
    const activeListings = await this.listingRepository.count({ where: { status: ListingStatus.ACTIVE } });
    return { newListings, activeListings, timeRange };
  }

  async getFraudAnalytics(timeRange: string): Promise<any> {
    const { start, end } = this.getDateRange(timeRange);
    const alerts = await this.fraudAlertRepository.find({ where: { createdAt: Between(start, end) } });
    const openAlerts = alerts.filter((a) => a.status === FraudAlertStatus.OPEN).length;
    const confirmedAlerts = alerts.filter((a) => a.status === FraudAlertStatus.CONFIRMED).length;
    return { totalAlerts: alerts.length, openAlerts, confirmedAlerts, averageRiskScore: alerts.length > 0 ? alerts.reduce((s, a) => s + a.riskScore, 0) / alerts.length : 0, timeRange };
  }

  async getSellerPerformance(timeRange: string): Promise<any> {
    const { start, end } = this.getDateRange(timeRange);
    const transactions = await this.escrowRepository.find({
      where: { createdAt: Between(start, end), status: EscrowStatus.COMPLETED },
      relations: ['seller'],
    });
    const sellerMap = new Map<string, { sales: number; revenue: number; seller: any }>();
    transactions.forEach((t) => {
      const id = t.sellerId;
      const existing = sellerMap.get(id) || { sales: 0, revenue: 0, seller: t.seller };
      existing.sales += 1;
      existing.revenue += parseFloat(t.amount.toString());
      sellerMap.set(id, existing);
    });
    const topSellers = Array.from(sellerMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    return { topSellers, timeRange };
  }

  async getDeviceTrends(timeRange: string): Promise<any> {
    const { start, end } = this.getDateRange(timeRange);
    const listings = await this.listingRepository.find({ where: { createdAt: Between(start, end), status: ListingStatus.ACTIVE } });
    const brandMap = new Map<string, number>();
    listings.forEach((l) => {
      if (l.brand) brandMap.set(l.brand, (brandMap.get(l.brand) || 0) + 1);
    });
    const topBrands = Array.from(brandMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([brand, count]) => ({ brand, count }));
    return { topBrands, totalListings: listings.length, timeRange };
  }

  async getRevenueReport(startDate: string, endDate: string): Promise<any> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const transactions = await this.escrowRepository.find({
      where: { createdAt: Between(start, end), status: EscrowStatus.COMPLETED },
    });
    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const totalFees = transactions.reduce((sum, t) => sum + parseFloat(t.platformFee.toString()), 0);
    return { totalRevenue, totalFees, netRevenue: totalRevenue - totalFees, transactionCount: transactions.length, startDate, endDate };
  }

  async generateReport(type: string, params: any): Promise<any> {
    switch (type) {
      case 'sales': return this.getSalesAnalytics(params.timeRange || '30d');
      case 'users': return this.getUserAnalytics(params.timeRange || '30d');
      case 'listings': return this.getListingAnalytics(params.timeRange || '30d');
      case 'fraud': return this.getFraudAnalytics(params.timeRange || '30d');
      case 'revenue': return this.getRevenueReport(params.startDate, params.endDate);
      default: return { message: 'Unknown report type' };
    }
  }
}
