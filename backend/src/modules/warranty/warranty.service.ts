import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Warranty, WarrantyStatus, WarrantyType } from './entities/warranty.entity';
import { WarrantyClaim, ClaimStatus } from './entities/warranty-claim.entity';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class WarrantyService {
  private readonly logger = new LoggerService('WarrantyService');

  constructor(
    @InjectRepository(Warranty)
    private readonly warrantyRepository: Repository<Warranty>,
    @InjectRepository(WarrantyClaim)
    private readonly claimRepository: Repository<WarrantyClaim>,
  ) {}

  async createWarranty(dto: CreateWarrantyDto): Promise<Warranty> {
    try {
      const startDate = new Date(dto.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + dto.durationMonths);

      const warranty = this.warrantyRepository.create({
        ...dto,
        startDate,
        endDate,
        status: WarrantyStatus.ACTIVE,
      });

      const saved = await this.warrantyRepository.save(warranty);
      this.logger.log(`Warranty created: ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error('Failed to create warranty', error.stack);
      throw error;
    }
  }

  async getWarranty(id: string): Promise<Warranty> {
    try {
      const warranty = await this.warrantyRepository.findOne({
        where: { id },
        relations: ['seller', 'buyer'],
      });
      if (!warranty) throw new NotFoundException('Warranty not found');
      return warranty;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to get warranty ${id}`, error.stack);
      throw error;
    }
  }

  async checkCoverage(warrantyId: string, issue: string): Promise<{ covered: boolean; details: string }> {
    try {
      const warranty = await this.getWarranty(warrantyId);
      if (warranty.status !== WarrantyStatus.ACTIVE) {
        return { covered: false, details: 'Warranty is not active' };
      }
      if (new Date() > warranty.endDate) {
        return { covered: false, details: 'Warranty has expired' };
      }
      const coverageText = warranty.coverage.toLowerCase();
      const issueLower = issue.toLowerCase();
      const covered = coverageText.includes(issueLower) || coverageText.includes('all');
      return {
        covered,
        details: covered ? 'Issue is covered under warranty' : 'Issue is not covered under the warranty terms',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to check coverage for warranty ${warrantyId}`, error.stack);
      throw error;
    }
  }

  async submitClaim(warrantyId: string, userId: string, dto: SubmitClaimDto): Promise<WarrantyClaim> {
    try {
      const warranty = await this.getWarranty(warrantyId);
      if (warranty.status !== WarrantyStatus.ACTIVE) {
        throw new BadRequestException('Cannot claim on an inactive warranty');
      }
      if (new Date() > warranty.endDate) {
        throw new BadRequestException('Warranty has expired');
      }

      const claim = this.claimRepository.create({
        warrantyId,
        userId,
        description: dto.description,
        evidence: dto.evidence || [],
        status: ClaimStatus.OPEN,
      });

      const saved = await this.claimRepository.save(claim);

      warranty.claimCount += 1;
      warranty.status = WarrantyStatus.CLAIMED;
      await this.warrantyRepository.save(warranty);

      this.logger.log(`Claim submitted: ${saved.id} for warranty ${warrantyId}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to submit claim for warranty ${warrantyId}`, error.stack);
      throw error;
    }
  }

  async approveClaim(claimId: string, adminId: string): Promise<WarrantyClaim> {
    try {
      const claim = await this.claimRepository.findOne({ where: { id: claimId }, relations: ['warranty'] });
      if (!claim) throw new NotFoundException('Claim not found');

      claim.status = ClaimStatus.APPROVED;
      claim.assignedTo = adminId;
      claim.resolvedAt = new Date();
      claim.resolution = 'Claim approved';

      const saved = await this.claimRepository.save(claim);

      if (claim.warranty) {
        claim.warranty.status = WarrantyStatus.CLAIMED;
        await this.warrantyRepository.save(claim.warranty);
      }

      this.logger.log(`Claim ${claimId} approved by ${adminId}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to approve claim ${claimId}`, error.stack);
      throw error;
    }
  }

  async rejectClaim(claimId: string, adminId: string, reason: string): Promise<WarrantyClaim> {
    try {
      const claim = await this.claimRepository.findOne({ where: { id: claimId }, relations: ['warranty'] });
      if (!claim) throw new NotFoundException('Claim not found');

      claim.status = ClaimStatus.REJECTED;
      claim.assignedTo = adminId;
      claim.resolvedAt = new Date();
      claim.resolution = reason;

      const saved = await this.claimRepository.save(claim);

      if (claim.warranty) {
        claim.warranty.status = WarrantyStatus.ACTIVE;
        await this.warrantyRepository.save(claim.warranty);
      }

      this.logger.log(`Claim ${claimId} rejected by ${adminId}: ${reason}`);
      return saved;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to reject claim ${claimId}`, error.stack);
      throw error;
    }
  }

  async getUserWarranties(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Warranty>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;
      const [items, total] = await this.warrantyRepository.findAndCount({
        where: [{ buyerId: userId }, { sellerId: userId }],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: ['seller', 'buyer'],
      });
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Failed to get warranties for user ${userId}`, error.stack);
      throw error;
    }
  }

  async getListingWarranty(listingId: string): Promise<Warranty | null> {
    try {
      const warranty = await this.warrantyRepository.findOne({
        where: { listingId, status: WarrantyStatus.ACTIVE },
        relations: ['seller', 'buyer'],
      });
      return warranty || null;
    } catch (error) {
      this.logger.error(`Failed to get listing warranty for ${listingId}`, error.stack);
      throw error;
    }
  }

  async expireWarranties(): Promise<number> {
    try {
      const result = await this.warrantyRepository.update(
        { status: WarrantyStatus.ACTIVE, endDate: LessThan(new Date()) },
        { status: WarrantyStatus.EXPIRED },
      );
      if (result.affected && result.affected > 0) {
        this.logger.log(`${result.affected} warranties expired`);
      }
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Failed to expire warranties', error.stack);
      throw error;
    }
  }

  async getExpiringSoon(days: number): Promise<Warranty[]> {
    try {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + days);

      return this.warrantyRepository.find({
        where: {
          status: WarrantyStatus.ACTIVE,
          endDate: Between(now, future),
        },
        relations: ['seller', 'buyer'],
        order: { endDate: 'ASC' },
      });
    } catch (error) {
      this.logger.error('Failed to get expiring warranties', error.stack);
      throw error;
    }
  }
}
