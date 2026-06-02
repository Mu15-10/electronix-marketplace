import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { LiveStream, StreamStatus } from './entities/live-stream.entity';
import { CreateStreamDto } from './dto/create-stream.dto';
import { AuditLog, AuditAction } from '../audit/entities/audit.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class LiveCommerceService {
  private readonly logger = new LoggerService('LiveCommerceService');

  constructor(
    @InjectRepository(LiveStream)
    private readonly streamRepository: Repository<LiveStream>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async createStream(dto: CreateStreamDto, sellerId: string): Promise<LiveStream> {
    try {
      const stream = this.streamRepository.create({
        sellerId,
        title: dto.title,
        description: dto.description,
        scheduledStart: new Date(dto.scheduledStart),
        chatEnabled: dto.chatEnabled ?? true,
        recordingEnabled: dto.recordingEnabled ?? false,
        thumbnailUrl: dto.thumbnailUrl,
        tags: dto.tags || [],
        products: dto.products || [],
        status: StreamStatus.SCHEDULED,
      });
      const saved = await this.streamRepository.save(stream);

      await this.auditLogRepository.save({
        action: AuditAction.CREATE,
        description: `Live stream created: ${saved.title}`,
        entityType: 'live_stream',
        entityId: saved.id,
        userId: sellerId,
      });

      return saved;
    } catch (error) {
      this.logger.error('Failed to create live stream', error.stack);
      throw error;
    }
  }

  async getStream(id: string): Promise<LiveStream> {
    try {
      const stream = await this.streamRepository.findOne({ where: { id } });
      if (!stream) throw new NotFoundException('Live stream not found');
      return stream;
    } catch (error) {
      this.logger.error(`Failed to get stream ${id}`, error.stack);
      throw error;
    }
  }

  async startStream(id: string, sellerId: string): Promise<LiveStream> {
    try {
      const stream = await this.getStream(id);
      if (stream.sellerId !== sellerId) throw new ForbiddenException('Not your stream');
      if (stream.status === StreamStatus.LIVE) throw new BadRequestException('Stream is already live');
      if (stream.status === StreamStatus.ENDED) throw new BadRequestException('Stream has ended');
      if (stream.status === StreamStatus.CANCELLED) throw new BadRequestException('Stream was cancelled');

      stream.status = StreamStatus.LIVE;
      stream.startedAt = new Date();
      const saved = await this.streamRepository.save(stream);

      await this.auditLogRepository.save({
        action: AuditAction.UPDATE,
        description: `Live stream started: ${saved.title}`,
        entityType: 'live_stream',
        entityId: id,
        userId: sellerId,
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to start stream ${id}`, error.stack);
      throw error;
    }
  }

  async endStream(id: string, sellerId: string): Promise<LiveStream> {
    try {
      const stream = await this.getStream(id);
      if (stream.sellerId !== sellerId) throw new ForbiddenException('Not your stream');
      if (stream.status !== StreamStatus.LIVE) throw new BadRequestException('Stream is not live');

      stream.status = StreamStatus.ENDED;
      stream.endedAt = new Date();
      const saved = await this.streamRepository.save(stream);

      await this.auditLogRepository.save({
        action: AuditAction.UPDATE,
        description: `Live stream ended: ${saved.title}`,
        entityType: 'live_stream',
        entityId: id,
        userId: sellerId,
      });

      return saved;
    } catch (error) {
      this.logger.error(`Failed to end stream ${id}`, error.stack);
      throw error;
    }
  }

  async getLiveStreams(): Promise<LiveStream[]> {
    try {
      return this.streamRepository.find({
        where: { status: StreamStatus.LIVE },
        order: { viewerCount: 'DESC' },
      });
    } catch (error) {
      this.logger.error('Failed to get live streams', error.stack);
      throw error;
    }
  }

  async getUpcomingStreams(pagination: { page: number; limit: number }): Promise<PaginatedResult<LiveStream>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;
      const [items, total] = await this.streamRepository.findAndCount({
        where: { status: StreamStatus.SCHEDULED, scheduledStart: MoreThanOrEqual(new Date()) },
        skip,
        take: limit,
        order: { scheduledStart: 'ASC' },
      });
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error('Failed to get upcoming streams', error.stack);
      throw error;
    }
  }

  async getSellerStreams(sellerId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<LiveStream>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const skip = (page - 1) * limit;
      const [items, total] = await this.streamRepository.findAndCount({
        where: { sellerId },
        skip,
        take: limit,
        order: { scheduledStart: 'DESC' },
      });
      return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
    } catch (error) {
      this.logger.error(`Failed to get seller streams for ${sellerId}`, error.stack);
      throw error;
    }
  }

  async pinProduct(streamId: string, listingId: string): Promise<LiveStream> {
    try {
      const stream = await this.getStream(streamId);
      const products = stream.products || [];
      const idx = products.findIndex((p) => p.listingId === listingId);
      if (idx === -1) throw new NotFoundException('Product not found in stream');

      products[idx].pinned = true;
      stream.products = products;
      return this.streamRepository.save(stream);
    } catch (error) {
      this.logger.error(`Failed to pin product ${listingId} to stream ${streamId}`, error.stack);
      throw error;
    }
  }

  async unpinProduct(streamId: string, listingId: string): Promise<LiveStream> {
    try {
      const stream = await this.getStream(streamId);
      const products = stream.products || [];
      const idx = products.findIndex((p) => p.listingId === listingId);
      if (idx === -1) throw new NotFoundException('Product not found in stream');

      products[idx].pinned = false;
      stream.products = products;
      return this.streamRepository.save(stream);
    } catch (error) {
      this.logger.error(`Failed to unpin product ${listingId} from stream ${streamId}`, error.stack);
      throw error;
    }
  }

  async updateViewerCount(streamId: string, count: number): Promise<LiveStream> {
    try {
      const stream = await this.getStream(streamId);
      stream.viewerCount = count;
      if (count > stream.maxViewers) stream.maxViewers = count;
      return this.streamRepository.save(stream);
    } catch (error) {
      this.logger.error(`Failed to update viewer count for stream ${streamId}`, error.stack);
      throw error;
    }
  }

  async recordViewer(streamId: string, userId: string): Promise<void> {
    try {
      const stream = await this.getStream(streamId);
      stream.viewerCount += 1;
      if (stream.viewerCount > stream.maxViewers) stream.maxViewers = stream.viewerCount;
      await this.streamRepository.save(stream);
    } catch (error) {
      this.logger.error(`Failed to record viewer for stream ${streamId}`, error.stack);
    }
  }

  async addStreamProduct(streamId: string, listingId: string): Promise<LiveStream> {
    try {
      const stream = await this.getStream(streamId);
      const products = stream.products || [];
      if (products.some((p) => p.listingId === listingId)) {
        throw new BadRequestException('Product already in stream');
      }
      products.push({ listingId, title: '', price: 0, imageUrl: '', pinned: false });
      stream.products = products;
      return this.streamRepository.save(stream);
    } catch (error) {
      this.logger.error(`Failed to add product ${listingId} to stream ${streamId}`, error.stack);
      throw error;
    }
  }

  async removeStreamProduct(streamId: string, listingId: string): Promise<LiveStream> {
    try {
      const stream = await this.getStream(streamId);
      stream.products = (stream.products || []).filter((p) => p.listingId !== listingId);
      return this.streamRepository.save(stream);
    } catch (error) {
      this.logger.error(`Failed to remove product ${listingId} from stream ${streamId}`, error.stack);
      throw error;
    }
  }

  async getStreamAnalytics(streamId: string): Promise<{
    stream: LiveStream;
    duration: number;
    peakViewers: number;
    totalProducts: number;
    pinnedProducts: number;
  }> {
    try {
      const stream = await this.getStream(streamId);
      const duration = stream.startedAt && stream.endedAt
        ? Math.floor((stream.endedAt.getTime() - stream.startedAt.getTime()) / 1000)
        : 0;

      return {
        stream,
        duration,
        peakViewers: stream.maxViewers,
        totalProducts: (stream.products || []).length,
        pinnedProducts: (stream.products || []).filter((p) => p.pinned).length,
      };
    } catch (error) {
      this.logger.error(`Failed to get analytics for stream ${streamId}`, error.stack);
      throw error;
    }
  }

  async recordSale(streamId: string, listingId: string, transactionId: string): Promise<void> {
    try {
      this.logger.log(`Sale recorded for stream ${streamId}, listing ${listingId}, transaction ${transactionId}`);
    } catch (error) {
      this.logger.error(`Failed to record sale for stream ${streamId}`, error.stack);
    }
  }
}
