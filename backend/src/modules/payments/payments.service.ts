import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentMethod } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class PaymentsService {
  private readonly logger = new LoggerService('PaymentsService');

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createPaymentIntent(amount: number, currency: string, metadata: Record<string, any>, userId: string): Promise<{ paymentIntentId: string; amount: number; currency: string }> {
    const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fee = parseFloat((amount * 0.029 + 0.3).toFixed(2));
    const netAmount = parseFloat((amount - fee).toFixed(2));

    const payment = this.paymentRepository.create({
      paymentIntentId,
      amount,
      fee,
      netAmount,
      currency: currency || 'usd',
      status: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.STRIPE,
      userId,
      metadata,
    });

    await this.paymentRepository.save(payment);

    return { paymentIntentId, amount, currency: currency || 'usd' };
  }

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { paymentIntentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = PaymentStatus.SUCCEEDED;
    payment.paidAt = new Date();
    await this.paymentRepository.save(payment);

    await this.auditLogRepository.save({
      action: AuditAction.PAYMENT,
      description: `Payment confirmed: ${paymentIntentId}, amount: ${payment.amount}`,
      entityType: 'payment',
      entityId: payment.id,
      userId: payment.userId,
    });

    return payment;
  }

  async processRefund(transactionId: string, amount?: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id: transactionId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.SUCCEEDED) throw new BadRequestException('Payment is not in a refundable state');

    if (amount && amount > payment.amount) throw new BadRequestException('Refund amount exceeds payment amount');

    payment.status = amount && amount < payment.amount ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    await this.paymentRepository.save(payment);

    await this.auditLogRepository.save({
      action: AuditAction.REFUND,
      description: `Payment refunded: ${payment.paymentIntentId}`,
      entityType: 'payment',
      entityId: payment.id,
    });

    return payment;
  }

  async getPaymentMethods(userId: string): Promise<any[]> {
    return [{ id: 'default', type: 'card', last4: '4242', brand: 'Visa', expiryMonth: 12, expiryYear: 2028 }];
  }

  async addPaymentMethod(userId: string, dto: any): Promise<any> {
    return { id: 'pm_' + Date.now(), ...dto };
  }

  async removePaymentMethod(userId: string, methodId: string): Promise<void> {
    return;
  }

  async webhookHandler(event: any): Promise<void> {
    this.logger.log(`Webhook received: ${event.type}`);
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.confirmPayment(event.data.object.id);
        break;
      case 'payment_intent.payment_failed':
        this.logger.error(`Payment failed: ${event.data.object.id}`);
        break;
    }
  }
}
