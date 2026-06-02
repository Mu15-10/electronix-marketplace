import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review' })
  async create(@Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.createReview(user.id, dto);
  }

  @Get('listing/:listingId')
  @ApiOperation({ summary: 'Get listing reviews' })
  async getListingReviews(
    @Param('listingId') listingId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.reviewsService.getListingReviews(listingId, { page, limit });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user reviews' })
  async getUserReviews(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.reviewsService.getUserReviews(userId, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  async getById(@Param('id') id: string) {
    return this.reviewsService.getReview(id);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark review as helpful' })
  async markHelpful(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.markHelpful(id, user.id);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a review' })
  async report(@Param('id') id: string, @Body('reason') reason: string) {
    await this.reviewsService.reportReview(id, reason);
    return { message: 'Review reported' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.reviewsService.deleteReview(id, user.id);
    return { message: 'Review deleted' };
  }
}
