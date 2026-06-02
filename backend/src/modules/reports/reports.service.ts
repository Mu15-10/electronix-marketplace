import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportRepository: Repository<Report>,
    @InjectRepository(AuditLog) private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createReport(reporterId: string, dto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create({
      reporterId,
      reportType: dto.reportType,
      targetId: dto.targetId,
      reason: dto.reason,
      description: dto.description,
      status: ReportStatus.PENDING,
    });
    return this.reportRepository.save(report);
  }

  async getReports(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<Report>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.reportType) where.reportType = filters.reportType;
    const [items, total] = await this.reportRepository.findAndCount({
      where, relations: ['reporter'], skip, take: limit, order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReport(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id }, relations: ['reporter', 'moderator'] });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async resolveReport(id: string, moderatorId: string, action: string): Promise<Report> {
    const report = await this.getReport(id);
    report.status = ReportStatus.RESOLVED;
    report.action = action;
    report.moderatorId = moderatorId;
    report.resolvedAt = new Date();
    await this.reportRepository.save(report);

    await this.auditLogRepository.save({
      action: AuditAction.RESOLVE,
      description: `Report resolved: ${report.reportType} - ${action}`,
      entityType: 'report',
      entityId: id,
      userId: moderatorId,
    });

    return report;
  }

  async dismissReport(id: string, moderatorId: string): Promise<Report> {
    const report = await this.getReport(id);
    report.status = ReportStatus.DISMISSED;
    report.moderatorId = moderatorId;
    report.resolvedAt = new Date();
    await this.reportRepository.save(report);
    return report;
  }
}
