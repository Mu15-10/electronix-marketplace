import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Loyalty')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('points')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my points balance' })
  async getPoints(@CurrentUser() user: any) {
    return this.loyaltyService.getPointsBalance(user.id);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get points transaction history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getHistory(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.loyaltyService.getPointsHistory(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('rewards')
  @ApiOperation({ summary: 'Get available rewards' })
  async getRewards() {
    return this.loyaltyService.getRewards();
  }

  @Post('rewards')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a reward (admin)' })
  async createReward(@Body() dto: any, @CurrentUser() user: any) {
    return this.loyaltyService.createReward(dto, user.id);
  }

  @Patch('rewards/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a reward (admin)' })
  async updateReward(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.loyaltyService.updateReward(id, dto, user.id);
  }

  @Post('redeem/:rewardId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem a reward' })
  async redeem(@CurrentUser() user: any, @Param('rewardId') rewardId: string) {
    return this.loyaltyService.redeemReward(user.id, rewardId);
  }

  @Get('tier')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my tier information and benefits' })
  async getTier(@CurrentUser() user: any) {
    const profile = await this.loyaltyService.getLoyaltyProfile(user.id);
    const benefits = this.loyaltyService.getTierBenefits(profile.currentTier);
    return { profile, benefits };
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get loyalty leaderboard' })
  @ApiQuery({ name: 'limit', required: false })
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.loyaltyService.getLeaderboard(limit ? parseInt(limit, 10) : 20);
  }

  @Get('referral-code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my referral code' })
  async getReferralCode(@CurrentUser() user: any) {
    const profile = await this.loyaltyService.getLoyaltyProfile(user.id);
    return { referralCode: profile.referralCode };
  }

  @Post('referral/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Claim referral bonus' })
  async claimReferral(@CurrentUser() user: any, @Body('code') code: string) {
    await this.loyaltyService.processReferral(code, user.id);
    return { message: 'Referral bonus claimed' };
  }
}
