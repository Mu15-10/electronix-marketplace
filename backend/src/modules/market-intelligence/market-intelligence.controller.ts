import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MarketIntelligenceService } from './market-intelligence.service';
import { InsightQueryDto } from './dto/insight-query.dto';
import { InsightPeriod } from './entities/market-insight.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Market Intelligence')
@Controller('market-intelligence')
export class MarketIntelligenceController {
  constructor(private readonly marketIntelligenceService: MarketIntelligenceService) {}

  @Get('demand')
  @ApiOperation({ summary: 'Get device demand insights' })
  async getDemand(@Query() query: InsightQueryDto) {
    return this.marketIntelligenceService.getDeviceDemand(query.brand, query.model);
  }

  @Get('prices')
  @ApiOperation({ summary: 'Get price trend insights' })
  async getPrices(@Query() query: InsightQueryDto) {
    return this.marketIntelligenceService.getPriceTrends(query.brand, query.model);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending brands' })
  @ApiQuery({ name: 'period', enum: InsightPeriod, required: false })
  async getTrending(@Query('period') period?: InsightPeriod) {
    return this.marketIntelligenceService.getTrendingBrands(period || InsightPeriod.WEEKLY);
  }

  @Get('regional')
  @ApiOperation({ summary: 'Get regional market trends' })
  @ApiQuery({ name: 'country', required: false })
  async getRegional(@Query('country') country?: string) {
    return this.marketIntelligenceService.getRegionalTrends(country);
  }

  @Get('top-searches')
  @ApiOperation({ summary: 'Get top search terms' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'period', enum: InsightPeriod, required: false })
  async getTopSearches(
    @Query('limit') limit?: number,
    @Query('period') period?: InsightPeriod,
  ) {
    return this.marketIntelligenceService.getTopSearches(limit || 10, period || InsightPeriod.WEEKLY);
  }

  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get personalized device recommendations' })
  async getRecommendations(@CurrentUser() user: User) {
    return this.marketIntelligenceService.getDeviceRecommendations(user.id);
  }

  @Get('seller')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get seller market insights' })
  async getSellerInsights(@CurrentUser() user: User) {
    return this.marketIntelligenceService.getSellerInsights(user.id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category performance metrics' })
  @ApiQuery({ name: 'category', required: true })
  async getCategoryPerformance(@Query('category') category: string) {
    return this.marketIntelligenceService.getCategoryPerformance(category);
  }

  @Get('behavior')
  @ApiOperation({ summary: 'Get aggregated user behavior insights' })
  async getUserBehavior() {
    return this.marketIntelligenceService.getUserBehaviorInsights();
  }
}
