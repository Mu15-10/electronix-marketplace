import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SellersService } from './sellers.service';
import { BecomeSellerDto } from './dto/become-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ListingStatus } from '../listings/entities/listing.entity';

@ApiTags('Sellers')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('become')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Become a seller' })
  async becomeSeller(@Body() dto: BecomeSellerDto, @CurrentUser() user: User) {
    return this.sellersService.becomeSeller(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my seller profile' })
  async getMyProfile(@CurrentUser() user: User) {
    return this.sellersService.getSellerProfile(user.id);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller dashboard' })
  async getDashboard(@CurrentUser() user: User) {
    return this.sellersService.getSellerDashboard(user.id);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller analytics' })
  async getAnalytics(@CurrentUser() user: User, @Query('timeRange') timeRange: string = '30d') {
    return this.sellersService.getSellerAnalytics(user.id, timeRange);
  }

  @Get('top')
  @ApiOperation({ summary: 'Get top sellers' })
  async getTopSellers(@Query('limit') limit: number = 10) {
    return this.sellersService.getTopSellers(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seller by ID' })
  async getById(@Param('id') id: string) {
    return this.sellersService.getSellerByUsername(id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update seller profile' })
  async updateProfile(@Body() dto: UpdateSellerDto, @CurrentUser() user: User) {
    return this.sellersService.updateSellerProfile(user.id, dto);
  }

  @Get(':id/listings')
  @ApiOperation({ summary: 'Get seller listings' })
  async getListings(
    @Param('id') id: string,
    @Query('status') status?: ListingStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.sellersService.getSellerListings(id, status, { page, limit });
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get seller reviews' })
  async getReviews(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.sellersService.getSellerReviews(id, { page, limit });
  }
}
