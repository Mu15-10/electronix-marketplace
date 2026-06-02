import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class ChatService {
  private readonly logger = new LoggerService('ChatService');

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getConversations(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Conversation>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('participant.id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMessages(conversationId: string, userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Message>> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) throw new ForbiddenException('Not a participant in this conversation');

    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      skip,
      take: limit,
      order: { createdAt: 'ASC' },
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async sendMessage(dto: SendMessageDto, senderId: string): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: dto.conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.id === senderId);
    if (!isParticipant) throw new ForbiddenException('Not a participant in this conversation');

    const message = this.messageRepository.create({
      content: dto.content,
      conversationId: dto.conversationId,
      senderId,
      attachments: dto.attachments || [],
    });

    const saved = await this.messageRepository.save(message);

    conversation.lastMessageAt = new Date();
    conversation.lastMessageContent = dto.content;
    conversation.lastMessageSenderId = senderId;
    await this.conversationRepository.save(conversation);

    return this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    }) as Promise<Message>;
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageRepository.createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();
  }

  async createConversation(dto: CreateConversationDto, creatorId?: string): Promise<Conversation> {
    const participants = await this.userRepository.find({
      where: dto.participantIds.map((id) => ({ id })) as any,
    });

    if (participants.length !== dto.participantIds.length) {
      throw new NotFoundException('One or more participants not found');
    }

    if (creatorId && !dto.participantIds.includes(creatorId)) {
      dto.participantIds.push(creatorId);
    }

    const conversation = this.conversationRepository.create({
      listingId: dto.listingId,
      participants,
    });

    return this.conversationRepository.save(conversation);
  }

  async getOrCreateConversation(user1Id: string, user2Id: string, listingId?: string): Promise<Conversation> {
    const existing = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .where('conversation.isGroup = :isGroup', { isGroup: false })
      .getMany();

    const found = existing.find((c) => {
      const pIds = c.participants.map((p) => p.id);
      return pIds.includes(user1Id) && pIds.includes(user2Id);
    });

    if (found) return found;

    return this.createConversation({
      participantIds: [user1Id, user2Id],
      listingId,
    });
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) throw new ForbiddenException('Not a participant');

    await this.messageRepository.delete({ conversationId });
    await this.conversationRepository.delete(conversationId);
  }
}
