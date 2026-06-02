import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between, MoreThan, FindOptionsWhere, Not, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Auction, AuctionStatus } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { AuctionWatcher } from './entities/auction-watcher.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AutoBidDto } from './dto/auto-bid.dto';
import { AuctionFilterDto } from './dto/auction-filter.dto';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';
import { User } from '../users/entities/user.entity';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { LoggerService } from '../../config/logger.config';

@Injectable()
export class AuctionService {
  private readonly logger = new LoggerService('AuctionService');

  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectRepository(AuctionWatcher)
    private readonly watcherRepository: Repository<AuctionWatcher>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async createAuction(listingId: string, sellerId: string, dto: CreateAuctionDto): Promise<Auction> {
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId !== sellerId) throw new ForbiddenException('You can only create auctions for your own listings');
    if (listing.listingType !== 'auction') throw new BadRequestException('Listing type must be auction');

    const existing = await this.auctionRepository.findOne({ where: { listingId, status: Not(In([AuctionStatus.CANCELLED, AuctionStatus.UNSOLD])) } });
    if (existing) throw new ConflictException('An active auction already exists for this listing');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate >= endDate) throw new BadRequestException('Start date must be before end date');
    if (startDate < new Date()) throw new BadRequestException('Start date cannot be in the past');

    const auction = this.auctionRepository.create({
      listingId,
      sellerId,
      startPrice: dto.startPrice,
      reservePrice: dto.reservePrice,
      currentBid: dto.startPrice,
      minBidIncrement: dto.minBidIncrement || 1,
      startDate,
      endDate,
      autoExtend: dto.autoExtend ?? true,
      extensionMinutes: dto.extensionMinutes || 5,
      status: AuctionStatus.PENDING,
      bidCount: 0,
      watcherCount: 0,
    });

    const saved = await this.auctionRepository.save(auction);
    this.logger.log(`Auction created: ${saved.id} for listing ${listingId}`);
    return saved;
  }

  async getAuction(id: string): Promise<any> {
    const auction = await this.auctionRepository.findOne({
      where: { id },
      relations: ['seller', 'listing', 'listing.seller'],
    });
    if (!auction) throw new NotFoundException('Auction not found');

    const now = new Date();
    const effectiveEnd = auction.extendedEnd || auction.endDate;
    const timeRemaining = Math.max(0, effectiveEnd.getTime() - now.getTime());

    return {
      ...auction,
      timeRemaining,
      timeRemainingSeconds: Math.floor(timeRemaining / 1000),
      isEnded: now >= effectiveEnd,
      currentBid: Number(auction.currentBid),
      startPrice: Number(auction.startPrice),
      reservePrice: auction.reservePrice ? Number(auction.reservePrice) : null,
      winningBid: auction.winningBid ? Number(auction.winningBid) : null,
    };
  }

  async placeBid(auctionId: string, bidderId: string, amount: number): Promise<Bid> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');

    if (auction.status !== AuctionStatus.ACTIVE) throw new BadRequestException('Auction is not active');
    if (auction.sellerId === bidderId) throw new ForbiddenException('Cannot bid on your own auction');

    const effectiveEnd = auction.extendedEnd || auction.endDate;
    if (new Date() >= effectiveEnd) throw new BadRequestException('Auction has ended');

    const minBid = Number(auction.currentBid) + Number(auction.minBidIncrement);
    if (amount < minBid) throw new BadRequestException(`Bid must be at least ${minBid}`);

    const lastBid = await this.bidRepository.findOne({
      where: { auctionId },
      order: { createdAt: 'DESC' },
    });
    if (lastBid && lastBid.bidderId === bidderId) throw new BadRequestException('You are already the highest bidder');

    const bid = this.bidRepository.create({
      auctionId,
      bidderId,
      amount,
      isAutoBid: false,
    });

    const saved = await this.bidRepository.save(bid);

    auction.currentBid = amount;
    auction.bidCount += 1;

    if (auction.autoExtend) {
      const now = new Date();
      const diffMs = effectiveEnd.getTime() - now.getTime();
      const diffMinutes = diffMs / 60000;
      if (diffMinutes <= 1) {
        const newEnd = new Date(effectiveEnd.getTime() + auction.extensionMinutes * 60000);
        auction.extendedEnd = newEnd;
        this.logger.log(`Auction ${auctionId} auto-extended by ${auction.extensionMinutes} minutes`);
      }
    }

    await this.auctionRepository.save(auction);

    await this.processAutoBids(auction);

    return saved;
  }

  async placeAutoBid(auctionId: string, bidderId: string, maxAmount: number): Promise<Bid> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.status !== AuctionStatus.ACTIVE) throw new BadRequestException('Auction is not active');
    if (auction.sellerId === bidderId) throw new ForbiddenException('Cannot bid on your own auction');

    const effectiveEnd = auction.extendedEnd || auction.endDate;
    if (new Date() >= effectiveEnd) throw new BadRequestException('Auction has ended');

    if (maxAmount <= Number(auction.currentBid)) throw new BadRequestException('Max auto-bid must exceed current bid');

    const existingAutoBid = await this.bidRepository.findOne({
      where: { auctionId, bidderId, isAutoBid: true },
    });

    if (existingAutoBid) {
      existingAutoBid.maxAutoBid = maxAmount;
      await this.bidRepository.save(existingAutoBid);
      await this.processAutoBids(auction);
      return existingAutoBid;
    }

    const currentBid = Number(auction.currentBid);
    const minIncrement = Number(auction.minBidIncrement);
    const bidAmount = Math.min(currentBid + minIncrement, maxAmount);

    const bid = this.bidRepository.create({
      auctionId,
      bidderId,
      amount: bidAmount,
      isAutoBid: true,
      maxAutoBid: maxAmount,
    });

    const saved = await this.bidRepository.save(bid);

    if (bidAmount > Number(auction.currentBid)) {
      auction.currentBid = bidAmount;
      auction.bidCount += 1;
      await this.auctionRepository.save(auction);
    }

    await this.processAutoBids(auction);

    return saved;
  }

  private async processAutoBids(auction: Auction): Promise<void> {
    try {
      const autoBids = await this.bidRepository.find({
        where: { auctionId: auction.id, isAutoBid: true },
        order: { maxAutoBid: 'DESC' },
      });

      if (autoBids.length < 2) return;

      const highest = autoBids[0];
      const secondHighest = autoBids[1];
      const currentBid = Number(auction.currentBid);
      const minIncrement = Number(auction.minBidIncrement);

      if (Number(highest.maxAutoBid) <= currentBid) return;

      const lastBid = await this.bidRepository.findOne({
        where: { auctionId: auction.id },
        order: { createdAt: 'DESC' },
      });

      if (lastBid && lastBid.bidderId === highest.bidderId) return;

      const newBidAmount = Math.min(
        Number(secondHighest.maxAutoBid) + minIncrement,
        Number(highest.maxAutoBid),
      );

      if (newBidAmount > currentBid) {
        const autoBid = this.bidRepository.create({
          auctionId: auction.id,
          bidderId: highest.bidderId,
          amount: newBidAmount,
          isAutoBid: true,
          maxAutoBid: highest.maxAutoBid,
        });

        await this.bidRepository.save(autoBid);
        auction.currentBid = newBidAmount;
        auction.bidCount += 1;
        await this.auctionRepository.save(auction);
      }
    } catch (err) {
      this.logger.error(`Failed to process auto bids for auction ${auction.id}: ${err.message}`);
    }
  }

  async getBids(auctionId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Bid>> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.bidRepository.findAndCount({
      where: { auctionId },
      relations: ['bidder'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserBids(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Bid>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.bidRepository.findAndCount({
      where: { bidderId: userId },
      relations: ['auction', 'auction.listing'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getWonAuctions(userId: string, pagination: { page: number; limit: number }): Promise<PaginatedResult<Auction>> {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await this.auctionRepository.findAndCount({
      where: { winnerId: userId, status: AuctionStatus.SOLD },
      relations: ['listing', 'listing.seller'],
      skip,
      take: limit,
      order: { soldAt: 'DESC' },
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async endAuction(auctionId: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.status !== AuctionStatus.ACTIVE) throw new BadRequestException('Auction is not active');

    const effectiveEnd = auction.extendedEnd || auction.endDate;
    if (new Date() < effectiveEnd) throw new BadRequestException('Auction has not ended yet');

    const highestBid = await this.bidRepository.findOne({
      where: { auctionId },
      order: { amount: 'DESC' },
    });

    if (highestBid && Number(highestBid.amount) >= Number(auction.reservePrice || 0)) {
      auction.status = AuctionStatus.SOLD;
      auction.winnerId = highestBid.bidderId;
      auction.winningBid = highestBid.amount;
      auction.soldAt = new Date();

      await this.listingRepository.update(auction.listingId, {
        status: ListingStatus.SOLD,
      });
    } else {
      auction.status = AuctionStatus.UNSOLD;
    }

    const saved = await this.auctionRepository.save(auction);
    this.logger.log(`Auction ${auctionId} ended with status ${saved.status}`);
    return saved;
  }

  async extendAuction(auctionId: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');

    const effectiveEnd = auction.extendedEnd || auction.endDate;
    const newEnd = new Date(effectiveEnd.getTime() + auction.extensionMinutes * 60000);
    auction.extendedEnd = newEnd;

    const saved = await this.auctionRepository.save(auction);
    this.logger.log(`Auction ${auctionId} manually extended to ${newEnd.toISOString()}`);
    return saved;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkEndingSoon(): Promise<void> {
    const now = new Date();

    try {
      const endingAuctions = await this.auctionRepository.find({
        where: {
          status: AuctionStatus.ACTIVE,
          endDate: LessThanOrEqual(now),
        },
      });

      for (const auction of endingAuctions) {
        try {
          const effectiveEnd = auction.extendedEnd || auction.endDate;
          if (now >= effectiveEnd) {
            await this.endAuction(auction.id);
          }
        } catch (err) {
          this.logger.error(`Failed to end auction ${auction.id}: ${err.message}`);
        }
      }
    } catch (err) {
      this.logger.error(`Failed to check ending auctions: ${err.message}`);
    }
  }

  async cancelAuction(auctionId: string, sellerId: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.sellerId !== sellerId) throw new ForbiddenException('You can only cancel your own auctions');
    if (auction.status !== AuctionStatus.PENDING && auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException('Auction cannot be cancelled');
    }

    auction.status = AuctionStatus.CANCELLED;
    const saved = await this.auctionRepository.save(auction);
    this.logger.log(`Auction ${auctionId} cancelled by seller ${sellerId}`);
    return saved;
  }

  async watchAuction(auctionId: string, userId: string): Promise<void> {
    const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');

    const existing = await this.watcherRepository.findOne({
      where: { auctionId, userId },
    });
    if (existing) throw new ConflictException('Already watching this auction');

    await this.watcherRepository.save(this.watcherRepository.create({ auctionId, userId }));
    await this.auctionRepository.increment({ id: auctionId }, 'watcherCount', 1);
  }

  async unwatchAuction(auctionId: string, userId: string): Promise<void> {
    const watcher = await this.watcherRepository.findOne({
      where: { auctionId, userId },
    });
    if (!watcher) throw new NotFoundException('Not watching this auction');

    await this.watcherRepository.delete(watcher.id);
    await this.auctionRepository.decrement({ id: auctionId }, 'watcherCount', 1);
  }

  async getActiveAuctions(filters: AuctionFilterDto): Promise<PaginatedResult<Auction>> {
    const {
      page = 1, limit = 20, sortBy = 'endDate', sortOrder = 'ASC',
      search, brand, model, priceMin, priceMax,
    } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auctionRepository.createQueryBuilder('auction')
      .leftJoinAndSelect('auction.listing', 'listing')
      .leftJoinAndSelect('auction.seller', 'seller')
      .where('auction.status = :status', { status: AuctionStatus.ACTIVE })
      .andWhere('auction.endDate > :now', { now: new Date() });

    if (search) {
      queryBuilder.andWhere('(listing.title ILIKE :search OR listing.description ILIKE :search)', { search: `%${search}%` });
    }
    if (brand) queryBuilder.andWhere('listing.brand = :brand', { brand });
    if (model) queryBuilder.andWhere('listing.model = :model', { model });
    if (priceMin !== undefined) queryBuilder.andWhere('auction.currentBid >= :priceMin', { priceMin });
    if (priceMax !== undefined) queryBuilder.andWhere('auction.currentBid <= :priceMax', { priceMax });

    const validSorts = ['endDate', 'currentBid', 'bidCount', 'startDate', 'createdAt'];
    const sort = validSorts.includes(sortBy) ? sortBy : 'endDate';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    queryBuilder.orderBy(`auction.${sort}`, order);

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAuctionTimer(id: string): Promise<{ timeRemaining: number; timeRemainingSeconds: number; isEnded: boolean }> {
    const auction = await this.auctionRepository.findOne({ where: { id } });
    if (!auction) throw new NotFoundException('Auction not found');

    const effectiveEnd = auction.extendedEnd || auction.endDate;
    const now = new Date();
    const timeRemaining = Math.max(0, effectiveEnd.getTime() - now.getTime());

    return {
      timeRemaining,
      timeRemainingSeconds: Math.floor(timeRemaining / 1000),
      isEnded: now >= effectiveEnd,
    };
  }
}
