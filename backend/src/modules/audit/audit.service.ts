import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(action: AuditAction, userId: string, description: string, metadata?: Record<string, any>, ipAddress?: string, userAgent?: string): Promise<AuditLog> {
    const log = this.auditLogRepository.create({
      action,
      userId,
      description,
      metadata,
      ipAddress,
      userAgent,
      entityType: metadata?.entityType,
      entityId: metadata?.entityId,
    });
    return this.auditLogRepository.save(log);
  }

  async getLogs(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<AuditLog>> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    const [items, total] = await this.auditLogRepository.findAndCount({
      where, relations: ['user'], skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserLogs(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<AuditLog>> {
    return this.getLogs({ userId }, pagination);
  }

  async getLog(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({ where: { id }, relations: ['user'] });
    if (!log) throw new Error('Audit log not found');
    return log;
  }

  async getLogsByAction(action: AuditAction, pagination: { page: number; limit: number }): Promise<PaginatedResult<AuditLog>> {
    return this.getLogs({ action }, pagination);
  }

  async getLogsByDateRange(startDate: Date, endDate: Date, pagination: { page: number; limit: number }): Promise<PaginatedResult<AuditLog>> {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.auditLogRepository.findAndCount({
      where: { createdAt: Between(startDate, endDate) },
      skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async exportLogs(filters: any): Promise<any[]> {
    const where: any = {};
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    return this.auditLogRepository.find({ where, order: { createdAt: 'DESC' }, take: 10000 });
  }
}
