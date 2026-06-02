import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CommissionConfig, CommissionType } from './entities/commission-config.entity';
import { CommissionTransaction, CommissionTransactionStatus } from './entities/commission-transaction.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class CommissionService {
  private readonly logger = new LoggerService('CommissionService');
  private readonly PLATFORM_FIXED_FEE = 0.50;
  private readonly PLATFORM_PERCENTAGE_FEE = 0.02;

  constructor(
    @InjectRepository(CommissionConfig)
    private readonly configRepository: Repository<CommissionConfig>,
    @InjectRepository(CommissionTransaction)
    private readonly transactionRepository: Repository<CommissionTransaction>,
  ) {}

  async getCommissionConfigs(): Promise<CommissionConfig[]> {
    return this.configRepository.find({ order: { priority: 'ASC' } });
  }

  async createCommissionConfig(dto: Partial<CommissionConfig>, adminId: string): Promise<CommissionConfig> {
    const config = this.configRepository.create(dto);
    const saved = await this.configRepository.save(config);
    this.logger.log(`Commission config created: ${saved.id} by admin ${adminId}`);
    return saved;
  }

  async updateCommissionConfig(id: string, dto: Partial<CommissionConfig>, adminId: string): Promise<CommissionConfig> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) throw new NotFoundException('Commission config not found');
    Object.assign(config, dto);
    const saved = await this.configRepository.save(config);
    this.logger.log(`Commission config ${id} updated by admin ${adminId}`);
    return saved;
  }

  async deleteCommissionConfig(id: string, adminId: string): Promise<void> {
    const config = await this.configRepository.findOne({ where: { id } });
    if (!config) throw new NotFoundException('Commission config not found');
    await this.configRepository.remove(config);
    this.logger.log(`Commission config ${id} deleted by admin ${adminId}`);
  }

  async calculateCommission(amount: number, category?: string, sellerLevel?: number): Promise<{ type: CommissionType; value: number; amount: number }> {
    const configs = await this.configRepository.find({
      where: { isActive: true },
      order: { priority: 'DESC' },
    });

    let matchedConfig: CommissionConfig | null = null;

    for (const config of configs) {
      if (config.sellerLevel !== null && sellerLevel !== undefined) {
        if (config.sellerLevel === sellerLevel) {
          if (!config.category || (category && config.category === category)) {
            matchedConfig = config;
            break;
          }
        }
        continue;
      }
      if (config.category && category && config.category === category) {
        matchedConfig = config;
        break;
      }
    }

    if (!matchedConfig) {
      matchedConfig = configs.find(c => !c.category && c.sellerLevel === null) || null;
    }

    if (!matchedConfig) {
      throw new BadRequestException('No applicable commission configuration found');
    }

    let commissionAmount: number;
    if (matchedConfig.type === CommissionType.PERCENTAGE) {
      commissionAmount = (amount * matchedConfig.value) / 100;
    } else {
      commissionAmount = matchedConfig.value;
    }

    if (matchedConfig.minFee !== null && commissionAmount < matchedConfig.minFee) {
      commissionAmount = matchedConfig.minFee;
    }
    if (matchedConfig.maxFee !== null && commissionAmount > matchedConfig.maxFee) {
      commissionAmount = matchedConfig.maxFee;
    }

    return {
      type: matchedConfig.type,
      value: matchedConfig.value,
      amount: Math.round(commissionAmount * 100) / 100,
    };
  }

  calculatePlatformFee(amount: number): number {
    return Math.round((amount * this.PLATFORM_PERCENTAGE_FEE + this.PLATFORM_FIXED_FEE) * 100) / 100;
  }

  async calculateTotalFees(amount: number, category?: string, sellerLevel?: number) {
    const commission = await this.calculateCommission(amount, category, sellerLevel);
    const platformFee = this.calculatePlatformFee(amount);
    const totalFees = Math.round((commission.amount + platformFee) * 100) / 100;
    const netAmount = Math.round((amount - totalFees) * 100) / 100;

    return {
      saleAmount: amount,
      commission,
      platformFee,
      totalFees,
      netAmount,
    };
  }

  async recordCommissionTransaction(
    transactionId: string,
    saleAmount: number,
    sellerId: string,
    listingId?: string,
    category?: string,
    sellerLevel?: number,
  ): Promise<CommissionTransaction> {
    const fees = await this.calculateTotalFees(saleAmount, category, sellerLevel);

    const transaction = this.transactionRepository.create({
      transactionId,
      sellerId,
      listingId: listingId || undefined,
      saleAmount,
      commissionType: fees.commission.type,
      commissionValue: fees.commission.value,
      commissionAmount: fees.commission.amount,
      platformFee: fees.platformFee,
      taxAmount: 0,
      netAmount: fees.netAmount,
      currency: 'USD',
      status: CommissionTransactionStatus.PENDING,
    } as CommissionTransaction);

    const saved = await this.transactionRepository.save(transaction);
    this.logger.log(`Commission recorded: ${saved.id} for transaction ${transactionId}`);
    return saved;
  }

  async markAsPaid(transactionId: string): Promise<CommissionTransaction> {
    const record = await this.transactionRepository.findOne({ where: { transactionId } });
    if (!record) throw new NotFoundException('Commission transaction not found');
    if (record.status === CommissionTransactionStatus.PAID) throw new BadRequestException('Already marked as paid');

    record.status = CommissionTransactionStatus.PAID;
    record.paidAt = new Date();

    const saved = await this.transactionRepository.save(record);
    this.logger.log(`Commission ${record.id} marked as paid`);
    return saved;
  }

  async getSellerCommissions(sellerId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<CommissionTransaction>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.transactionRepository.findAndCount({
      where: { sellerId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPlatformRevenue(filters?: { startDate?: string; endDate?: string }): Promise<{
    totalCommission: number;
    totalPlatformFees: number;
    totalTax: number;
    totalNet: number;
    count: number;
  }> {
    const where: any = { status: CommissionTransactionStatus.PAID };

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date(filters.endDate));
    } else if (filters?.startDate) {
      where.createdAt = Between(new Date(filters.startDate), new Date());
    } else if (filters?.endDate) {
      where.createdAt = Between(new Date('1970-01-01'), new Date(filters.endDate));
    }

    const transactions = await this.transactionRepository.find({ where });

    return {
      totalCommission: Math.round(transactions.reduce((s, t) => s + Number(t.commissionAmount), 0) * 100) / 100,
      totalPlatformFees: Math.round(transactions.reduce((s, t) => s + Number(t.platformFee), 0) * 100) / 100,
      totalTax: Math.round(transactions.reduce((s, t) => s + Number(t.taxAmount), 0) * 100) / 100,
      totalNet: Math.round(transactions.reduce((s, t) => s + Number(t.netAmount), 0) * 100) / 100,
      count: transactions.length,
    };
  }

  async getCommissionBreakdown(transactionId: string) {
    const record = await this.transactionRepository.findOne({ where: { transactionId } });
    if (!record) throw new NotFoundException('Commission transaction not found');

    return {
      saleAmount: Number(record.saleAmount),
      commission: {
        type: record.commissionType,
        value: Number(record.commissionValue),
        amount: Number(record.commissionAmount),
      },
      platformFee: Number(record.platformFee),
      taxAmount: Number(record.taxAmount),
      netAmount: Number(record.netAmount),
      totalDeductions: Number(record.commissionAmount) + Number(record.platformFee) + Number(record.taxAmount),
    };
  }
}
