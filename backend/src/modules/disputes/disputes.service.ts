import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { User } from '../users/entities/user.entity';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class DisputesService {
  private readonly logger = new LoggerService('DisputesService');

  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createDispute(transactionId: string, userId: string, dto: CreateDisputeDto): Promise<Dispute> {
    const dispute = this.disputeRepository.create({
      disputeNumber: `DSP-${Date.now().toString(36).toUpperCase()}-${uuid().substring(0, 4).toUpperCase()}`,
      transactionId: dto.transactionId,
      buyerId: userId,
      sellerId: dto.transactionId, // Would be looked up from transaction
      reason: dto.reason,
      description: dto.description,
      status: DisputeStatus.OPEN,
    });

    const saved = await this.disputeRepository.save(dispute);

    await this.auditLogRepository.save({
      action: AuditAction.DISPUTE,
      description: `Dispute created: ${saved.disputeNumber}`,
      entityType: 'dispute',
      entityId: saved.id,
      userId,
    });

    return saved;
  }

  async getDispute(id: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['buyer', 'seller', 'moderator'],
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }

  async getUserDisputes(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Dispute>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.disputeRepository.findAndCount({
      where: [{ buyerId: userId }, { sellerId: userId }],
      skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addEvidence(disputeId: string, userId: string, evidence: { url: string; type: string }): Promise<Dispute> {
    const dispute = await this.getDispute(disputeId);
    if (dispute.buyerId !== userId && dispute.sellerId !== userId) {
      throw new ForbiddenException('Not a party to this dispute');
    }
    const evidenceEntry = { ...evidence, uploadedBy: userId, uploadedAt: new Date() };
    dispute.evidence = [...(dispute.evidence || []), evidenceEntry];
    return this.disputeRepository.save(dispute);
  }

  async resolveDispute(disputeId: string, moderatorId: string, resolution: string): Promise<Dispute> {
    const dispute = await this.getDispute(disputeId);
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolution = resolution;
    dispute.resolvedById = moderatorId;
    dispute.resolvedAt = new Date();
    await this.disputeRepository.save(dispute);

    await this.auditLogRepository.save({
      action: AuditAction.RESOLVE,
      description: `Dispute resolved: ${dispute.disputeNumber}. Resolution: ${resolution}`,
      entityType: 'dispute',
      entityId: disputeId,
      userId: moderatorId,
    });

    return dispute;
  }

  async escalateDispute(disputeId: string): Promise<Dispute> {
    const dispute = await this.getDispute(disputeId);
    dispute.status = DisputeStatus.ESCALATED;
    await this.disputeRepository.save(dispute);

    await this.auditLogRepository.save({
      action: AuditAction.ESCALATE,
      description: `Dispute escalated: ${dispute.disputeNumber}`,
      entityType: 'dispute',
      entityId: disputeId,
    });

    return dispute;
  }

  async assignModerator(disputeId: string, moderatorId: string): Promise<Dispute> {
    const dispute = await this.getDispute(disputeId);
    dispute.moderatorId = moderatorId;
    dispute.status = DisputeStatus.INVESTIGATING;
    return this.disputeRepository.save(dispute);
  }

  async getAllDisputes(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<Dispute>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.reason) where.reason = filters.reason;
    const [items, total] = await this.disputeRepository.findAndCount({
      where, relations: ['buyer', 'seller'], skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
