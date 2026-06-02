import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  async getPlan(@Param('id') id: string) {
    return this.subscriptionService.getPlan(id);
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a subscription plan (admin)' })
  async createPlan(@Body() dto: any, @CurrentUser() user: any) {
    return this.subscriptionService.createPlan(dto, user.id);
  }

  @Patch('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subscription plan (admin)' })
  async updatePlan(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.subscriptionService.updatePlan(id, dto, user.id);
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Subscribe to a plan' })
  async subscribe(@CurrentUser() user: any, @Body('planCode') planCode: string, @Body() dto: any) {
    return this.subscriptionService.subscribe(user.id, planCode, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription' })
  async getMySubscription(@CurrentUser() user: any) {
    return this.subscriptionService.getSubscription(user.id);
  }

  @Post('my/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel current subscription' })
  async cancelMySubscription(@CurrentUser() user: any) {
    const sub = await this.subscriptionService.getSubscription(user.id);
    if (!sub) return { message: 'No active subscription' };
    return this.subscriptionService.cancelSubscription(sub.id, user.id);
  }

  @Post('my/upgrade/:planCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upgrade subscription plan' })
  async upgradePlan(@CurrentUser() user: any, @Param('planCode') planCode: string) {
    return this.subscriptionService.upgradePlan(user.id, planCode);
  }

  @Post('my/downgrade/:planCode')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Downgrade subscription plan' })
  async downgradePlan(@CurrentUser() user: any, @Param('planCode') planCode: string) {
    return this.subscriptionService.downgradePlan(user.id, planCode);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription history' })
  async getHistory(@CurrentUser() user: any) {
    return this.subscriptionService.getSubscriptionHistory(user.id);
  }
}
