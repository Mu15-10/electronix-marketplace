import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/entities/user.entity';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { EscrowTransaction, EscrowStatus } from '../escrow/entities/escrow.entity';
import { Dispute, DisputeStatus } from '../disputes/entities/dispute.entity';
import { FraudAlert, FraudAlertStatus } from '../fraud/entities/fraud-alert.entity';
import { Verification, VerificationStatus } from '../verification/entities/verification.entity';
import { AuditLog } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Listing) private readonly listingRepository: Repository<Listing>,
    @InjectRepository(EscrowTransaction) private readonly escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(Dispute) private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(FraudAlert) private readonly fraudAlertRepository: Repository<FraudAlert>,
    @InjectRepository(Verification) private readonly verificationRepository: Repository<Verification>,
    @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getDashboardStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const totalListings = await this.listingRepository.count();
    const activeListings = await this.listingRepository.count({ where: { status: ListingStatus.ACTIVE } });
    const pendingListings = await this.listingRepository.count({ where: { status: ListingStatus.PENDING } });
    const totalTransactions = await this.escrowRepository.count();
    const completedTransactions = await this.escrowRepository.count({ where: { status: EscrowStatus.COMPLETED } });
    const pendingVerifications = await this.verificationRepository.count({ where: { status: VerificationStatus.PENDING } });
    const openDisputes = await this.disputeRepository.count({ where: { status: DisputeStatus.OPEN } });
    const fraudAlerts = await this.fraudAlertRepository.count({ where: { status: FraudAlertStatus.OPEN } });

    return {
      users: { total: totalUsers, active: activeUsers },
      listings: { total: totalListings, active: activeListings, pending: pendingListings },
      transactions: { total: totalTransactions, completed: completedTransactions },
      moderation: { pendingVerifications, openDisputes, fraudAlerts },
    };
  }

  async getUserManagementData(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.role) where.role = filters.role;
    const [items, total] = await this.userRepository.findAndCount({ where, skip, take: limit, order: { createdAt: 'DESC' } });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getListingManagementData(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<Listing>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const [items, total] = await this.listingRepository.findAndCount({ where, relations: ['seller'], skip, take: limit, order: { createdAt: 'DESC' } });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDisputesData(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<Dispute>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    const [items, total] = await this.disputeRepository.findAndCount({ where, skip, take: limit, order: { createdAt: 'DESC' } });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getVerificationQueue(): Promise<Verification[]> {
    return this.verificationRepository.find({ where: { status: VerificationStatus.PENDING }, relations: ['user'], order: { createdAt: 'ASC' }, take: 50 });
  }

  async getModerationQueue(): Promise<{ flaggedListings: Listing[]; fraudAlerts: FraudAlert[] }> {
    const flaggedListings = await this.listingRepository.find({ where: { status: ListingStatus.FLAGGED }, relations: ['seller'], take: 50 });
    const fraudAlerts = await this.fraudAlertRepository.find({ where: { status: FraudAlertStatus.OPEN }, order: { riskScore: 'DESC' }, take: 50 });
    return { flaggedListings, fraudAlerts };
  }

  async getSystemHealth(): Promise<any> {
    return {
      status: 'healthy',
      server: { uptime: process.uptime(), memory: process.memoryUsage(), cpu: process.cpuUsage() },
      database: { connected: true },
      cache: { connected: true },
      queue: { connected: true },
      timestamp: new Date().toISOString(),
    };
  }

  async getAuditLogs(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<AuditLog>> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    const [items, total] = await this.auditLogRepository.findAndCount({ where, relations: ['user'], skip, take: limit, order: { createdAt: 'DESC' } });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getSecurityAlerts(): Promise<FraudAlert[]> {
    return this.fraudAlertRepository.find({ where: { status: FraudAlertStatus.OPEN }, order: { riskScore: 'DESC' }, take: 20 });
  }
}
