import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Shipping, ShippingStatus, DeliveryType } from './entities/shipping.entity';
import { ShippingProvider } from './entities/shipping-provider.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SchedulePickupDto } from './dto/schedule-pickup.dto';
import { AddProviderDto } from './dto/add-provider.dto';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class ShippingService {
  private readonly logger = new LoggerService('ShippingService');

  constructor(
    @InjectRepository(Shipping)
    private readonly shippingRepository: Repository<Shipping>,
    @InjectRepository(ShippingProvider)
    private readonly providerRepository: Repository<ShippingProvider>,
  ) {}

  async createShipment(dto: CreateShipmentDto): Promise<Shipping> {
    try {
      const trackingNumber = `TRK-${Date.now().toString(36).toUpperCase()}-${uuid().substring(0, 6).toUpperCase()}`;
      const shipment = this.shippingRepository.create({
        ...dto,
        trackingNumber,
        status: ShippingStatus.PENDING,
        statusHistory: [{ status: ShippingStatus.PENDING, timestamp: new Date().toISOString() }],
      });
      const saved = await this.shippingRepository.save(shipment);
      this.logger.log(`Shipment created: ${saved.id}, tracking: ${trackingNumber}`);
      return saved;
    } catch (error) {
      this.logger.error('Failed to create shipment', error.stack);
      throw error;
    }
  }

  async getShipment(id: string): Promise<Shipping> {
    try {
      const shipment = await this.shippingRepository.findOne({
        where: { id },
        relations: ['sender', 'recipient'],
      });
      if (!shipment) throw new NotFoundException('Shipment not found');
      return shipment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to get shipment ${id}`, error.stack);
      throw error;
    }
  }

  async trackShipment(trackingNumber: string): Promise<Shipping> {
    try {
      const shipment = await this.shippingRepository.findOne({
        where: { trackingNumber },
        relations: ['sender', 'recipient'],
      });
      if (!shipment) throw new NotFoundException('Tracking number not found');
      return shipment;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to track shipment ${trackingNumber}`, error.stack);
      throw error;
    }
  }

  async updateStatus(shipmentId: string, status: ShippingStatus, note?: string, location?: string): Promise<Shipping> {
    try {
      const shipment = await this.getShipment(shipmentId);
      shipment.status = status;

      const historyEntry: any = { status, timestamp: new Date().toISOString() };
      if (note) historyEntry.note = note;
      if (location) historyEntry.location = location;
      shipment.statusHistory = [...(shipment.statusHistory || []), historyEntry];

      if (status === ShippingStatus.DELIVERED) {
        shipment.deliveredAt = new Date();
      }

      return this.shippingRepository.save(shipment);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to update status for shipment ${shipmentId}`, error.stack);
      throw error;
    }
  }

  async calculateCost(weight: number, dimensions: { length: number; width: number; height: number; unit: string }, from: string, to: string, deliveryType: DeliveryType): Promise<{ cost: number; currency: string; estimatedDays: number }> {
    try {
      const baseRate = 5.00;
      const weightFactor = weight * 0.5;
      const volume = (dimensions.length * dimensions.width * dimensions.height) / 1000;
      const volumeFactor = volume * 0.2;
      const typeMultipliers: Record<DeliveryType, number> = {
        [DeliveryType.STANDARD]: 1.0,
        [DeliveryType.EXPRESS]: 1.8,
        [DeliveryType.SAME_DAY]: 2.5,
        [DeliveryType.NEXT_DAY]: 2.0,
        [DeliveryType.SCHEDULED]: 1.3,
        [DeliveryType.PICKUP]: 0,
      };
      const estimatedDays: Record<DeliveryType, number> = {
        [DeliveryType.STANDARD]: 5,
        [DeliveryType.EXPRESS]: 2,
        [DeliveryType.SAME_DAY]: 1,
        [DeliveryType.NEXT_DAY]: 1,
        [DeliveryType.SCHEDULED]: 3,
        [DeliveryType.PICKUP]: 0,
      };
      const multiplier = typeMultipliers[deliveryType] || 1;
      const cost = parseFloat(((baseRate + weightFactor + volumeFactor) * multiplier).toFixed(2));

      return { cost, currency: 'usd', estimatedDays: estimatedDays[deliveryType] || 5 };
    } catch (error) {
      this.logger.error('Failed to calculate shipping cost', error.stack);
      throw error;
    }
  }

  async getProviders(): Promise<ShippingProvider[]> {
    try {
      return this.providerRepository.find({ where: { isActive: true } });
    } catch (error) {
      this.logger.error('Failed to get providers', error.stack);
      throw error;
    }
  }

  async addProvider(dto: AddProviderDto): Promise<ShippingProvider> {
    try {
      const existing = await this.providerRepository.findOne({ where: { code: dto.code } });
      if (existing) throw new BadRequestException('Provider with this code already exists');

      const provider = this.providerRepository.create(dto);
      return this.providerRepository.save(provider);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('Failed to add provider', error.stack);
      throw error;
    }
  }

  async removeProvider(id: string): Promise<void> {
    try {
      const provider = await this.providerRepository.findOne({ where: { id } });
      if (!provider) throw new NotFoundException('Provider not found');
      await this.providerRepository.remove(provider);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to remove provider ${id}`, error.stack);
      throw error;
    }
  }

  getDeliveryTypes(): { types: { key: string; label: string }[] } {
    return {
      types: Object.values(DeliveryType).map((key) => ({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    };
  }

  async generateDeliveryPin(shipmentId: string): Promise<{ pin: string }> {
    try {
      const shipment = await this.getShipment(shipmentId);
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      shipment.deliveryPin = pin;
      await this.shippingRepository.save(shipment);
      return { pin };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to generate delivery pin for ${shipmentId}`, error.stack);
      throw error;
    }
  }

  async verifyDelivery(shipmentId: string, pin: string): Promise<{ verified: boolean; message: string }> {
    try {
      const shipment = await this.getShipment(shipmentId);
      if (!shipment.deliveryPin) {
        return { verified: false, message: 'No delivery PIN set for this shipment' };
      }
      if (shipment.deliveryPin !== pin) {
        return { verified: false, message: 'Invalid delivery PIN' };
      }
      shipment.status = ShippingStatus.DELIVERED;
      shipment.deliveredAt = new Date();
      shipment.statusHistory = [
        ...(shipment.statusHistory || []),
        { status: ShippingStatus.DELIVERED, timestamp: new Date().toISOString(), note: 'Delivery verified via PIN' },
      ];
      await this.shippingRepository.save(shipment);
      return { verified: true, message: 'Delivery verified successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to verify delivery for ${shipmentId}`, error.stack);
      throw error;
    }
  }

  async getShippingLabel(shipmentId: string): Promise<{ labelUrl: string; shipment: Shipping }> {
    try {
      const shipment = await this.getShipment(shipmentId);
      const labelUrl = `https://labels.shipping.example.com/${shipment.trackingNumber}.pdf`;
      return { labelUrl, shipment };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to get shipping label for ${shipmentId}`, error.stack);
      throw error;
    }
  }

  async getShipmentsByUser(userId: string, role: 'buyer' | 'seller'): Promise<Shipping[]> {
    try {
      const filter = role === 'buyer' ? { recipientId: userId } : { senderId: userId };
      return this.shippingRepository.find({
        where: filter,
        order: { createdAt: 'DESC' },
        relations: ['sender', 'recipient'],
      });
    } catch (error) {
      this.logger.error(`Failed to get shipments for user ${userId}`, error.stack);
      throw error;
    }
  }

  async schedulePickup(shipmentId: string, dto: SchedulePickupDto): Promise<Shipping> {
    try {
      const shipment = await this.getShipment(shipmentId);
      shipment.statusHistory = [
        ...(shipment.statusHistory || []),
        { status: ShippingStatus.PENDING, timestamp: new Date().toISOString(), note: `Pickup scheduled: ${dto.pickupDate} ${dto.timeRange}` },
      ];
      return this.shippingRepository.save(shipment);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to schedule pickup for ${shipmentId}`, error.stack);
      throw error;
    }
  }
}
