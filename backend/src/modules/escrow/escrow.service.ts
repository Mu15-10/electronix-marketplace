import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { EscrowTransaction, EscrowStatus } from './entities/escrow.entity';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class EscrowService {
  private readonly logger = new LoggerService('EscrowService');
  private readonly platformFeePercent = 0.05;

  constructor(
    @InjectRepository(EscrowTransaction)
    private readonly escrowRepository: Repository<EscrowTransaction>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createTransaction(buyerId: string, listingId: string, dto: CreateEscrowDto): Promise<EscrowTransaction> {
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== ListingStatus.ACTIVE) throw new BadRequestException('Listing is not active');
    if (listing.sellerId === buyerId) throw new BadRequestException('Cannot buy your own listing');

    const fees = this.calculateFees(dto.amount);
    const transaction = this.escrowRepository.create({
      transactionNumber: this.generateTransactionNumber(),
      buyerId,
      sellerId: dto.sellerId,
      listingId,
      amount: dto.amount,
      platformFee: fees.platformFee,
      sellerAmount: fees.sellerAmount,
      status: EscrowStatus.PENDING,
      notes: dto.notes,
    });

    const saved = await this.escrowRepository.save(transaction);

    await this.auditLogRepository.save({
      action: AuditAction.CREATE,
      description: `Escrow transaction created: ${saved.transactionNumber}`,
      entityType: 'escrow',
      entityId: saved.id,
      userId: buyerId,
    });

    return saved;
  }

  async holdPayment(transactionId: string, paymentIntentId: string): Promise<EscrowTransaction> {
    const transaction = await this.findById(transactionId);
    if (transaction.status !== EscrowStatus.PENDING) {
      throw new BadRequestException('Transaction is not in pending status');
    }
    transaction.status = EscrowStatus.FUNDED;
    transaction.paymentIntentId = paymentIntentId;
    transaction.fundedAt = new Date();
    return this.escrowRepository.save(transaction);
  }

  async confirmDelivery(transactionId: string, userId: string): Promise<EscrowTransaction> {
    const transaction = await this.findById(transactionId);
    if (transaction.buyerId !== userId) throw new ForbiddenException('Only buyer can confirm delivery');
    if (transaction.status !== EscrowStatus.IN_TRANSIT) {
      throw new BadRequestException('Transaction is not in transit');
    }
    transaction.status = EscrowStatus.DELIVERED;
    transaction.deliveredAt = new Date();
    return this.escrowRepository.save(transaction);
  }

  async releasePayment(transactionId: string): Promise<EscrowTransaction> {
    const transaction = await this.findById(transactionId);
    if (transaction.status !== EscrowStatus.DELIVERED && transaction.status !== EscrowStatus.FUNDED) {
      throw new BadRequestException('Cannot release payment in current status');
    }
    transaction.status = EscrowStatus.COMPLETED;
    transaction.completedAt = new Date();
    return this.escrowRepository.save(transaction);
  }

  async refund(transactionId: string, reason: string, amount?: number): Promise<EscrowTransaction> {
    const transaction = await this.findById(transactionId);
    if (transaction.status === EscrowStatus.COMPLETED || transaction.status === EscrowStatus.REFUNDED) {
      throw new BadRequestException('Transaction already completed or refunded');
    }

    if (amount && amount > transaction.amount) {
      throw new BadRequestException('Refund amount exceeds transaction amount');
    }

    transaction.status = EscrowStatus.REFUNDED;
    transaction.cancellationReason = reason;
    transaction.cancelledAt = new Date();

    if (amount) {
      transaction.metadata = { ...transaction.metadata, refundAmount: amount };
    }

    await this.escrowRepository.save(transaction);

    await this.auditLogRepository.save({
      action: AuditAction.REFUND,
      description: `Escrow refunded: ${transaction.transactionNumber}. Reason: ${reason}`,
      entityType: 'escrow',
      entityId: transactionId,
    });

    return transaction;
  }

  async freezeDisputed(transactionId: string): Promise<EscrowTransaction> {
    const transaction = await this.findById(transactionId);
    transaction.status = EscrowStatus.DISPUTED;
    return this.escrowRepository.save(transaction);
  }

  calculateFees(amount: number): { platformFee: number; sellerAmount: number } {
    const platformFee = parseFloat((amount * this.platformFeePercent).toFixed(2));
    const sellerAmount = parseFloat((amount - platformFee).toFixed(2));
    return { platformFee, sellerAmount };
  }

  generateTransactionNumber(): string {
    const prefix = 'ESC';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuid().substring(0, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async getTransactionHistory(
    userId: string, role: 'buyer' | 'seller', pagination: { page: number; limit: number },
  ): Promise<PaginatedResult<EscrowTransaction>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    const field = role === 'buyer' ? { buyerId: userId } : { sellerId: userId };

    const [items, total] = await this.escrowRepository.findAndCount({
      where: field,
      relations: ['listing', 'buyer', 'seller'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getTransactionsByStatus(status: EscrowStatus): Promise<EscrowTransaction[]> {
    return this.escrowRepository.find({
      where: { status },
      relations: ['listing', 'buyer', 'seller'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<EscrowTransaction> {
    const transaction = await this.escrowRepository.findOne({
      where: { id },
      relations: ['listing', 'buyer', 'seller'],
    });
    if (!transaction) throw new NotFoundException('Escrow transaction not found');
    return transaction;
  }
}
