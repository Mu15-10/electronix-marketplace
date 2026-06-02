import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { SupportTicket, TicketStatus, TicketCategory, TicketPriority } from './entities/support-ticket.entity';
import { TicketMessage, SenderRole } from './entities/ticket-message.entity';
import { FAQ } from './entities/faq.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class SupportService {
  private readonly logger = new LoggerService('SupportService');

  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    @InjectRepository(TicketMessage)
    private readonly messageRepository: Repository<TicketMessage>,
    @InjectRepository(FAQ)
    private readonly faqRepository: Repository<FAQ>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  // ---- TICKETS ----

  async createTicket(dto: CreateTicketDto, userId: string): Promise<SupportTicket> {
    try {
      const ticket = this.ticketRepository.create({
        userId,
        ticketNumber: await this.generateTicketNumber(),
        subject: dto.subject,
        description: dto.description,
        category: dto.category,
        priority: dto.priority || TicketPriority.MEDIUM,
        source: dto.source || 'web' as any,
        status: TicketStatus.OPEN,
      });
      const saved = await this.ticketRepository.save(ticket);

      await this.auditLogRepository.save({
        action: AuditAction.CREATE,
        description: `Support ticket created: ${saved.ticketNumber}`,
        entityType: 'support_ticket',
        entityId: saved.id,
        userId,
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create support ticket', error.stack);
      throw error;
    }
  }

  async getTicket(id: string): Promise<SupportTicket> {
    try {
      const ticket = await this.ticketRepository.findOne({ where: { id } });
      if (!ticket) throw new NotFoundException('Ticket not found');
      return ticket;
    } catch (error) {
      this.logger.error(`Failed to get ticket ${id}`, error.stack);
      throw error;
    }
  }

  async getUserTickets(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<SupportTicket>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;
      const [items, total] = await this.ticketRepository.findAndCount({
        where: { userId },
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Failed to get user tickets for ${userId}`, error.stack);
      throw error;
    }
  }

  async getAllTickets(filters: any, pagination: { page: number; limit: number }): Promise<PaginatedResult<SupportTicket>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.category) where.category = filters.category;
      if (filters.priority) where.priority = filters.priority;
      if (filters.assignedToId) where.assignedToId = filters.assignedToId;

      const [items, total] = await this.ticketRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error('Failed to get all tickets', error.stack);
      throw error;
    }
  }

  async addMessage(
    ticketId: string,
    senderId: string,
    senderRole: SenderRole,
    dto: AddMessageDto,
  ): Promise<TicketMessage> {
    try {
      const ticket = await this.getTicket(ticketId);
      if (ticket.status === TicketStatus.CLOSED) throw new BadRequestException('Ticket is closed');

      const message = this.messageRepository.create({
        ticketId,
        senderId,
        senderRole,
        message: dto.message,
        attachments: dto.attachments || [],
        isInternal: dto.isInternal || false,
      });
      const saved = await this.messageRepository.save(message);

      if (senderRole === SenderRole.USER && ticket.status === TicketStatus.OPEN) {
        await this.ticketRepository.update(ticketId, { status: TicketStatus.AWAITING_REPLY });
      } else if (senderRole !== SenderRole.USER && ticket.status === TicketStatus.AWAITING_REPLY) {
        await this.ticketRepository.update(ticketId, { status: TicketStatus.IN_PROGRESS });
      }

      return saved;
    } catch (error) {
      this.logger.error(`Failed to add message to ticket ${ticketId}`, error.stack);
      throw error;
    }
  }

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    try {
      await this.getTicket(ticketId);
      return this.messageRepository.find({
        where: { ticketId, isInternal: false },
        order: { createdAt: 'ASC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get messages for ticket ${ticketId}`, error.stack);
      throw error;
    }
  }

  async updateStatus(ticketId: string, status: TicketStatus, agentId: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getTicket(ticketId);
      ticket.status = status;

      if (status === TicketStatus.RESOLVED) ticket.resolvedAt = new Date();
      if (status === TicketStatus.CLOSED) ticket.closedAt = new Date();

      const saved = await this.ticketRepository.save(ticket);

      await this.auditLogRepository.save({
        action: AuditAction.UPDATE,
        description: `Ticket ${saved.ticketNumber} status changed to ${status}`,
        entityType: 'support_ticket',
        entityId: ticketId,
        userId: agentId,
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to update ticket ${ticketId} status`, error.stack);
      throw error;
    }
  }

  async assignTicket(ticketId: string, agentId: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getTicket(ticketId);
      ticket.assignedToId = agentId;
      ticket.assignedAt = new Date();
      if (ticket.status === TicketStatus.OPEN) ticket.status = TicketStatus.IN_PROGRESS;

      const saved = await this.ticketRepository.save(ticket);

      await this.auditLogRepository.save({
        action: AuditAction.UPDATE,
        description: `Ticket ${saved.ticketNumber} assigned to agent ${agentId}`,
        entityType: 'support_ticket',
        entityId: ticketId,
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to assign ticket ${ticketId}`, error.stack);
      throw error;
    }
  }

  async resolveTicket(ticketId: string, agentId: string, resolution?: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getTicket(ticketId);
      ticket.status = TicketStatus.RESOLVED;
      ticket.resolvedAt = new Date();
      ticket.assignedToId = agentId;

      const saved = await this.ticketRepository.save(ticket);

      if (resolution) {
        await this.messageRepository.create({
          ticketId,
          senderId: agentId,
          senderRole: SenderRole.AGENT,
          message: `Resolution: ${resolution}`,
          isInternal: false,
        });
      }

      await this.auditLogRepository.save({
        action: AuditAction.RESOLVE,
        description: `Ticket resolved: ${saved.ticketNumber}`,
        entityType: 'support_ticket',
        entityId: ticketId,
        userId: agentId,
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to resolve ticket ${ticketId}`, error.stack);
      throw error;
    }
  }

  async closeTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const ticket = await this.getTicket(ticketId);
      ticket.status = TicketStatus.CLOSED;
      ticket.closedAt = new Date();
      return this.ticketRepository.save(ticket);
    } catch (error) {
      this.logger.error(`Failed to close ticket ${ticketId}`, error.stack);
      throw error;
    }
  }

  async rateTicket(ticketId: string, userId: string, rating: number): Promise<SupportTicket> {
    try {
      if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');

      const ticket = await this.getTicket(ticketId);
      if (ticket.userId !== userId) throw new ForbiddenException('Not your ticket');
      if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) {
        throw new BadRequestException('Ticket must be resolved or closed to rate');
      }

      ticket.rating = rating;
      return this.ticketRepository.save(ticket);
    } catch (error) {
      this.logger.error(`Failed to rate ticket ${ticketId}`, error.stack);
      throw error;
    }
  }

  // ---- FAQS ----

  async createFAQ(dto: CreateFaqDto): Promise<FAQ> {
    try {
      const faq = this.faqRepository.create(dto);
      return this.faqRepository.save(faq);
    } catch (error) {
      this.logger.error('Failed to create FAQ', error.stack);
      throw error;
    }
  }

  async updateFAQ(id: string, dto: UpdateFaqDto): Promise<FAQ> {
    try {
      const faq = await this.faqRepository.findOne({ where: { id } });
      if (!faq) throw new NotFoundException('FAQ not found');
      Object.assign(faq, dto);
      return this.faqRepository.save(faq);
    } catch (error) {
      this.logger.error(`Failed to update FAQ ${id}`, error.stack);
      throw error;
    }
  }

  async deleteFAQ(id: string): Promise<void> {
    try {
      const result = await this.faqRepository.delete(id);
      if (result.affected === 0) throw new NotFoundException('FAQ not found');
    } catch (error) {
      this.logger.error(`Failed to delete FAQ ${id}`, error.stack);
      throw error;
    }
  }

  async getFAQs(category?: string, language?: string): Promise<FAQ[]> {
    try {
      const where: any = { isPublished: true };
      if (category) where.category = category;
      if (language) where.language = language;
      return this.faqRepository.find({ where, order: { order: 'ASC' } });
    } catch (error) {
      this.logger.error('Failed to get FAQs', error.stack);
      throw error;
    }
  }

  async searchFAQs(query: string, language?: string): Promise<FAQ[]> {
    try {
      const where: any[] = [
        { question: ILike(`%${query}%`), isPublished: true },
        { answer: ILike(`%${query}%`), isPublished: true },
      ];
      if (language) {
        where[0].language = language;
        where[1].language = language;
      }
      return this.faqRepository.find({ where, order: { order: 'ASC' } });
    } catch (error) {
      this.logger.error(`Failed to search FAQs with query ${query}`, error.stack);
      throw error;
    }
  }

  // ---- STATISTICS ----

  async generateTicketNumber(): Promise<string> {
    const digits = Math.floor(10000 + Math.random() * 90000);
    return `TKT-${digits}`;
  }

  async getTicketStatistics(): Promise<{
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    total: number;
    open: number;
    resolved: number;
    closed: number;
  }> {
    try {
      const tickets = await this.ticketRepository.find();

      const byStatus: Record<string, number> = {};
      const byCategory: Record<string, number> = {};
      const byPriority: Record<string, number> = {};

      for (const t of tickets) {
        byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        byCategory[t.category] = (byCategory[t.category] || 0) + 1;
        byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;
      }

      return {
        byStatus,
        byCategory,
        byPriority,
        total: tickets.length,
        open: byStatus[TicketStatus.OPEN] || 0,
        resolved: byStatus[TicketStatus.RESOLVED] || 0,
        closed: byStatus[TicketStatus.CLOSED] || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get ticket statistics', error.stack);
      throw error;
    }
  }
}
