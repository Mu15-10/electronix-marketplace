import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inspection, InspectionStatus } from './entities/inspection.entity';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { CompleteInspectionDto } from './dto/complete-inspection.dto';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class InspectionService {
  private readonly logger = new LoggerService('InspectionService');

  constructor(
    @InjectRepository(Inspection)
    private readonly inspectionRepository: Repository<Inspection>,
  ) {}

  async scheduleInspection(dto: ScheduleInspectionDto): Promise<Inspection> {
    try {
      const existing = await this.inspectionRepository.findOne({
        where: { listingId: dto.listingId, status: InspectionStatus.PENDING },
      });
      if (existing) {
        throw new BadRequestException('An inspection is already scheduled for this listing');
      }

      const inspection = this.inspectionRepository.create({
        listingId: dto.listingId,
        inspectorId: dto.inspectorId,
        scheduledAt: new Date(dto.scheduledAt),
        status: InspectionStatus.PENDING,
      });

      const saved = await this.inspectionRepository.save(inspection);
      this.logger.log(`Inspection scheduled: ${saved.id} for listing ${dto.listingId}`);
      return saved;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to schedule inspection', error.stack);
      throw error;
    }
  }

  async startInspection(id: string): Promise<Inspection> {
    try {
      const inspection = await this.getInspection(id);
      if (inspection.status !== InspectionStatus.PENDING) {
        throw new BadRequestException(`Cannot start inspection with status ${inspection.status}`);
      }

      inspection.status = InspectionStatus.IN_PROGRESS;
      const saved = await this.inspectionRepository.save(inspection);
      this.logger.log(`Inspection started: ${id}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to start inspection ${id}`, error.stack);
      throw error;
    }
  }

  async completeInspection(id: string, dto: CompleteInspectionDto): Promise<Inspection> {
    try {
      const inspection = await this.getInspection(id);
      if (inspection.status !== InspectionStatus.IN_PROGRESS) {
        throw new BadRequestException('Inspection must be in progress to complete');
      }

      Object.assign(inspection, {
        deviceAuthenticity: dto.deviceAuthenticity,
        deviceCondition: dto.deviceCondition ?? null,
        batteryHealth: dto.batteryHealth ?? null,
        screenCondition: dto.screenCondition ?? null,
        cameraFunctionality: dto.cameraFunctionality ?? null,
        hardwareIssues: dto.hardwareIssues ?? [],
        imeiValid: dto.imeiValid ?? false,
        serialValid: dto.serialValid ?? false,
        inspectionReport: dto.inspectionReport ?? null,
        completedAt: new Date(),
      });

      const rejected = !dto.deviceAuthenticity || (dto.hardwareIssues && dto.hardwareIssues.length > 0);
      inspection.status = rejected ? InspectionStatus.REJECTED : InspectionStatus.COMPLETED;
      inspection.score = this.calculateScore(dto);
      inspection.verifiedBadge = inspection.score >= 80;

      const saved = await this.inspectionRepository.save(inspection);
      this.logger.log(`Inspection completed: ${id}, score: ${saved.score}, status: ${saved.status}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to complete inspection ${id}`, error.stack);
      throw error;
    }
  }

  async getInspection(id: string): Promise<Inspection> {
    try {
      const inspection = await this.inspectionRepository.findOne({
        where: { id },
        relations: ['inspector'],
      });
      if (!inspection) throw new NotFoundException('Inspection not found');
      return inspection;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to get inspection ${id}`, error.stack);
      throw error;
    }
  }

  async getListingInspections(listingId: string): Promise<Inspection[]> {
    try {
      return this.inspectionRepository.find({
        where: { listingId },
        relations: ['inspector'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get inspections for listing ${listingId}`, error.stack);
      throw error;
    }
  }

  async getInspectorSchedule(inspectorId: string): Promise<Inspection[]> {
    try {
      return this.inspectionRepository.find({
        where: { inspectorId },
        relations: ['inspector'],
        order: { scheduledAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get schedule for inspector ${inspectorId}`, error.stack);
      throw error;
    }
  }

  async getPendingInspections(): Promise<Inspection[]> {
    try {
      return this.inspectionRepository.find({
        where: { status: InspectionStatus.PENDING },
        relations: ['inspector'],
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error('Failed to get pending inspections', error.stack);
      throw error;
    }
  }

  async verifyBadge(inspectionId: string, adminId: string): Promise<Inspection> {
    try {
      const inspection = await this.getInspection(inspectionId);
      if (inspection.status !== InspectionStatus.COMPLETED) {
        throw new BadRequestException('Only completed inspections can receive a verified badge');
      }
      if (inspection.verifiedBadge) {
        throw new BadRequestException('Badge already verified');
      }

      inspection.verifiedBadge = true;
      const saved = await this.inspectionRepository.save(inspection);
      this.logger.log(`Badge verified for inspection ${inspectionId} by admin ${adminId}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to verify badge for inspection ${inspectionId}`, error.stack);
      throw error;
    }
  }

  async generateCertificate(inspectionId: string): Promise<{ certificateUrl: string; inspection: Inspection }> {
    try {
      const inspection = await this.getInspection(inspectionId);
      if (inspection.status !== InspectionStatus.COMPLETED) {
        throw new BadRequestException('Certificate can only be generated for completed inspections');
      }

      const certificateUrl = `https://certificates.inspection.example.com/${inspectionId}.pdf`;
      inspection.certificateUrl = certificateUrl;
      await this.inspectionRepository.save(inspection);

      return { certificateUrl, inspection };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to generate certificate for inspection ${inspectionId}`, error.stack);
      throw error;
    }
  }

  calculateScore(dto: CompleteInspectionDto): number {
    let score = 100;
    if (!dto.deviceAuthenticity) score -= 40;
    if (dto.batteryHealth != null && dto.batteryHealth < 80) score -= 15;
    if (dto.hardwareIssues && dto.hardwareIssues.length > 0) {
      score -= dto.hardwareIssues.length * 10;
    }
    if (dto.screenCondition && !['pristine', 'good', 'excellent'].includes(dto.screenCondition.toLowerCase())) {
      score -= 10;
    }
    if (!dto.imeiValid) score -= 10;
    if (!dto.serialValid) score -= 5;
    if (dto.cameraFunctionality && ['not_working', 'non_functional'].includes(dto.cameraFunctionality.toLowerCase())) score -= 10;
    return Math.max(0, Math.min(100, score));
  }
}
