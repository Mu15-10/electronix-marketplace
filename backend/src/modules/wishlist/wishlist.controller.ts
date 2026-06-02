import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.wishlistService.getUserWishlist(user.id, { page, limit });
  }

  @Post(':listingId')
  @ApiOperation({ summary: 'Add listing to wishlist' })
  async addItem(@Param('listingId') listingId: string, @CurrentUser() user: User) {
    return this.wishlistService.addItem(user.id, listingId);
  }

  @Delete(':listingId')
  @ApiOperation({ summary: 'Remove listing from wishlist' })
  async removeItem(@Param('listingId') listingId: string, @CurrentUser() user: User) {
    await this.wishlistService.removeItem(user.id, listingId);
    return { message: 'Removed from wishlist' };
  }

  @Get('check/:listingId')
  @ApiOperation({ summary: 'Check if listing is in wishlist' })
  async checkItem(@Param('listingId') listingId: string, @CurrentUser() user: User) {
    return this.wishlistService.checkInWishlist(user.id, listingId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear entire wishlist' })
  async clearWishlist(@CurrentUser() user: User) {
    await this.wishlistService.clearWishlist(user.id);
    return { message: 'Wishlist cleared' };
  }
}
