import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LiveCommerceService } from './live-commerce.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Live Commerce')
@Controller('live-commerce')
export class LiveCommerceController {
  constructor(private readonly liveCommerceService: LiveCommerceService) {}

  @Post('streams')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a live stream' })
  async createStream(@Body() dto: CreateStreamDto, @CurrentUser() user: User) {
    return this.liveCommerceService.createStream(dto, user.id);
  }

  @Get('streams/live')
  @ApiOperation({ summary: 'Get currently live streams' })
  async getLiveStreams() {
    return this.liveCommerceService.getLiveStreams();
  }

  @Get('streams/upcoming')
  @ApiOperation({ summary: 'Get upcoming scheduled streams' })
  async getUpcomingStreams(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.liveCommerceService.getUpcomingStreams({ page, limit });
  }

  @Get('streams/:id')
  @ApiOperation({ summary: 'Get stream by ID' })
  async getStream(@Param('id') id: string) {
    return this.liveCommerceService.getStream(id);
  }

  @Patch('streams/:id/start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start a live stream' })
  async startStream(@Param('id') id: string, @CurrentUser() user: User) {
    return this.liveCommerceService.startStream(id, user.id);
  }

  @Patch('streams/:id/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End a live stream' })
  async endStream(@Param('id') id: string, @CurrentUser() user: User) {
    return this.liveCommerceService.endStream(id, user.id);
  }

  @Post('streams/:id/pin/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pin product to stream' })
  async pinProduct(@Param('id') id: string, @Param('listingId') listingId: string) {
    return this.liveCommerceService.pinProduct(id, listingId);
  }

  @Delete('streams/:id/pin/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpin product from stream' })
  async unpinProduct(@Param('id') id: string, @Param('listingId') listingId: string) {
    return this.liveCommerceService.unpinProduct(id, listingId);
  }

  @Get('my-streams')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my streams (seller)' })
  async getMyStreams(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.liveCommerceService.getSellerStreams(user.id, { page, limit });
  }

  @Get('streams/:id/analytics')
  @ApiOperation({ summary: 'Get stream analytics' })
  async getStreamAnalytics(@Param('id') id: string) {
    return this.liveCommerceService.getStreamAnalytics(id);
  }
}
