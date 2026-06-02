import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics' })
  async getSales(@Query('timeRange') timeRange: string = '30d') {
    return this.analyticsService.getSalesAnalytics(timeRange);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user analytics' })
  async getUsers(@Query('timeRange') timeRange: string = '30d') {
    return this.analyticsService.getUserAnalytics(timeRange);
  }

  @Get('listings')
  @ApiOperation({ summary: 'Get listing analytics' })
  async getListings(@Query('timeRange') timeRange: string = '30d') {
    return this.analyticsService.getListingAnalytics(timeRange);
  }

  @Get('fraud')
  @ApiOperation({ summary: 'Get fraud analytics' })
  async getFraud(@Query('timeRange') timeRange: string = '30d') {
    return this.analyticsService.getFraudAnalytics(timeRange);
  }

  @Get('sellers')
  @ApiOperation({ summary: 'Get seller performance analytics' })
  async getSellers(@Query('timeRange') timeRange: string = '30d') {
    return this.analyticsService.getSellerPerformance(timeRange);
  }

  @Get('device-trends')
  @ApiOperation({ summary: 'Get device trends' })
  async getDeviceTrends(@Query('timeRange') timeRange: string = '30d') {
    return this.analyticsService.getDeviceTrends(timeRange);
  }

  @Get('revenue-report')
  @ApiOperation({ summary: 'Get revenue report' })
  async getRevenueReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.analyticsService.getRevenueReport(startDate, endDate);
  }
}
