import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { AutoBidDto } from './dto/auto-bid.dto';
import { AuctionFilterDto } from './dto/auction-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new auction from a listing' })
  async create(
    @Body('listingId') listingId: string,
    @Body() dto: CreateAuctionDto,
    @CurrentUser() user: User,
  ) {
    return this.auctionService.createAuction(listingId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get active auctions with filters' })
  async findAll(@Query() filters: AuctionFilterDto) {
    return this.auctionService.getActiveAuctions(filters);
  }

  @Get('my-bids')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bid activity' })
  async getMyBids(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.auctionService.getUserBids(user.id, { page, limit });
  }

  @Get('won')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get won auctions for current user' })
  async getWon(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.auctionService.getWonAuctions(user.id, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get auction details' })
  async getById(@Param('id') id: string) {
    return this.auctionService.getAuction(id);
  }

  @Post(':id/bid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bid on auction' })
  async placeBid(
    @Param('id') id: string,
    @Body() dto: PlaceBidDto,
    @CurrentUser() user: User,
  ) {
    return this.auctionService.placeBid(id, user.id, dto.amount);
  }

  @Post(':id/auto-bid')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place an auto bid on auction' })
  async placeAutoBid(
    @Param('id') id: string,
    @Body() dto: AutoBidDto,
    @CurrentUser() user: User,
  ) {
    return this.auctionService.placeAutoBid(id, user.id, dto.maxAmount);
  }

  @Get(':id/bids')
  @ApiOperation({ summary: 'Get bid history for auction' })
  async getBids(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.auctionService.getBids(id, { page, limit });
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel auction (seller only)' })
  async cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return this.auctionService.cancelAuction(id, user.id);
  }

  @Post(':id/watch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Watch an auction' })
  async watch(@Param('id') id: string, @CurrentUser() user: User) {
    await this.auctionService.watchAuction(id, user.id);
    return { message: 'Now watching auction' };
  }

  @Delete(':id/watch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unwatch an auction' })
  async unwatch(@Param('id') id: string, @CurrentUser() user: User) {
    await this.auctionService.unwatchAuction(id, user.id);
    return { message: 'Stopped watching auction' };
  }

  @Get(':id/timer')
  @ApiOperation({ summary: 'Get remaining time for auction' })
  async getTimer(@Param('id') id: string) {
    return this.auctionService.getAuctionTimer(id);
  }
}
