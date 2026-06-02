import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationChannel } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../users/entities/user.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class NotificationsService {
  private readonly logger = new LoggerService('NotificationsService');

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      data: dto.data,
      link: dto.link,
      channel: dto.channel || NotificationChannel.IN_APP,
    });

    const saved = await this.notificationRepository.save(notification);

    try {
      const user = await this.userRepository.findOne({ where: { id: dto.userId } });
      if (user?.notificationPreferences) {
        if (user.notificationPreferences.email && dto.channel !== NotificationChannel.IN_APP) {
          await this.sendEmail(dto.userId, dto.title, 'notification', dto.data || {});
        }
        if (user.notificationPreferences.push) {
          await this.sendPushNotification(dto.userId, dto.title, dto.body || '', dto.data || {});
        }
      }
    } catch (err) {
      this.logger.warn(`Failed to send notification channels for user ${dto.userId}: ${err.message}`);
    }

    return saved;
  }

  async getUserNotifications(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Notification>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id: notificationId, userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async sendPushNotification(userId: string, title: string, body: string, data: Record<string, any>): Promise<void> {
    this.logger.log(`Push notification to ${userId}: ${title} - ${body}`);
  }

  async sendEmail(userId: string, subject: string, template: string, data: Record<string, any>): Promise<void> {
    this.logger.log(`Email to ${userId}: ${subject} (template: ${template})`);
  }

  async sendSMS(phone: string, message: string): Promise<void> {
    this.logger.log(`SMS to ${phone}: ${message}`);
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.notificationRepository.count({ where: { userId, isRead: false } });
    return { count };
  }
}
