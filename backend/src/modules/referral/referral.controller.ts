import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Referrals')
@Controller('referrals')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post('code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate referral code' })
  async generateCode(@CurrentUser() user: any) {
    return this.referralService.createReferralCode(user.id);
  }

  @Get('my-referrals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my referrals' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMyReferrals(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.referralService.getReferrals(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referral stats' })
  async getStats(@CurrentUser() user: any) {
    return this.referralService.getReferralStats(user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top referrers leaderboard' })
  @ApiQuery({ name: 'limit', required: false })
  async getLeaderboard(@Query('limit') limit?: string) {
    return this.referralService.getTopReferrers(limit ? parseInt(limit, 10) : 20);
  }
}
