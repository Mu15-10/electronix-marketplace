import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Verification, VerificationType, VerificationStatus } from './entities/verification.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class VerificationService {
  private readonly logger = new LoggerService('VerificationService');

  constructor(
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async submitIdentityDocument(userId: string, dto: any): Promise<Verification> {
    const existing = await this.verificationRepository.findOne({
      where: { userId, type: VerificationType.IDENTITY, status: VerificationStatus.PENDING },
    });
    if (existing) throw new BadRequestException('Identity verification already pending');

    const verification = this.verificationRepository.create({
      userId,
      type: VerificationType.IDENTITY,
      status: VerificationStatus.PENDING,
      documents: dto.documentImages?.map((url: string) => ({
        url,
        type: dto.documentType,
        name: dto.documentType,
        uploadedAt: new Date(),
      })) || [],
      metadata: {
        documentNumber: dto.documentNumber,
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth,
        nationality: dto.nationality,
      },
    });

    return this.verificationRepository.save(verification);
  }

  async verifyFaceMatch(userId: string, selfieImage: string): Promise<Verification> {
    const verification = this.verificationRepository.create({
      userId,
      type: VerificationType.FACE_MATCH,
      status: VerificationStatus.PENDING,
      documents: [{ url: selfieImage, type: 'selfie', name: 'Face Selfie', uploadedAt: new Date() }],
    });
    return this.verificationRepository.save(verification);
  }

  async checkLiveness(userId: string, videoData: string): Promise<Verification> {
    const verification = this.verificationRepository.create({
      userId,
      type: VerificationType.LIVENESS,
      status: VerificationStatus.PENDING,
      metadata: { videoData },
    });
    return this.verificationRepository.save(verification);
  }

  async verifyBusiness(userId: string, documents: any): Promise<Verification> {
    const verification = this.verificationRepository.create({
      userId,
      type: VerificationType.BUSINESS,
      status: VerificationStatus.PENDING,
      documents: documents.documents?.map((url: string) => ({
        url,
        type: 'business_document',
        name: 'Business Document',
        uploadedAt: new Date(),
      })) || [],
      metadata: { businessName: documents.businessName, registrationNumber: documents.registrationNumber },
    });
    return this.verificationRepository.save(verification);
  }

  async approveVerification(userId: string, verificationType: VerificationType, moderatorId: string): Promise<Verification> {
    const verification = await this.verificationRepository.findOne({
      where: { userId, type: verificationType, status: VerificationStatus.PENDING },
    });
    if (!verification) throw new NotFoundException('Verification request not found');

    verification.status = VerificationStatus.APPROVED;
    verification.approvedAt = new Date();
    verification.approvedById = moderatorId;
    await this.verificationRepository.save(verification);

    await this.auditLogRepository.save({
      action: AuditAction.VERIFY,
      description: `${verificationType} verification approved`,
      entityType: 'verification',
      entityId: verification.id,
      userId: moderatorId,
    });

    return verification;
  }

  async rejectVerification(userId: string, verificationType: VerificationType, reason: string, moderatorId: string): Promise<Verification> {
    const verification = await this.verificationRepository.findOne({
      where: { userId, type: verificationType, status: VerificationStatus.PENDING },
    });
    if (!verification) throw new NotFoundException('Verification request not found');

    verification.status = VerificationStatus.REJECTED;
    verification.rejectionReason = reason;
    verification.rejectedAt = new Date();
    verification.rejectedById = moderatorId;
    await this.verificationRepository.save(verification);

    await this.auditLogRepository.save({
      action: AuditAction.REJECT,
      description: `${verificationType} verification rejected: ${reason}`,
      entityType: 'verification',
      entityId: verification.id,
      userId: moderatorId,
    });

    return verification;
  }

  async getVerificationStatus(userId: string): Promise<Verification[]> {
    return this.verificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async calculateVerificationLevel(userId: string): Promise<{ level: number; completedVerifications: string[] }> {
    const verifications = await this.verificationRepository.find({
      where: { userId, status: VerificationStatus.APPROVED },
    });
    const completedVerifications = verifications.map((v) => v.type);
    const level = completedVerifications.length;
    return { level, completedVerifications };
  }

  async getPendingVerifications(pagination: { page: number; limit: number }): Promise<PaginatedResult<Verification>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const [items, total] = await this.verificationRepository.findAndCount({
      where: { status: VerificationStatus.PENDING },
      relations: ['user'],
      skip, take: limit, order: { createdAt: 'ASC' },
    });
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
