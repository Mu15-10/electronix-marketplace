import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AiPricingService } from './ai-pricing.service';
import { PriceSuggestionQueryDto } from './dto/price-suggestion-query.dto';
import { MarketHistoryQueryDto } from './dto/market-history-query.dto';

@ApiTags('AI Pricing')
@Controller('ai-pricing')
export class AiPricingController {
  constructor(private readonly aiPricingService: AiPricingService) {}

  @Post('analyze/:listingId')
  @ApiOperation({ summary: 'Analyze price for a specific listing' })
  async analyzePrice(@Param('listingId') listingId: string) {
    return this.aiPricingService.analyzePrice(listingId);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Get recommended price for a device' })
  async suggestPrice(@Query() query: PriceSuggestionQueryDto) {
    return this.aiPricingService.getRecommendedPrice(
      query.brand,
      query.model,
      query.variant,
      query.condition,
    );
  }

  @Get('market')
  @ApiOperation({ summary: 'Get market analysis for a device' })
  async getMarketAnalysis(@Query('brand') brand: string, @Query('model') model: string) {
    return this.aiPricingService.getMarketAnalysis(brand, model);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get price history for a device' })
  async getPriceHistory(@Query() query: MarketHistoryQueryDto) {
    return this.aiPricingService.getPriceHistory(query.brand, query.model, query.days);
  }

  @Get('prediction')
  @ApiOperation({ summary: 'Get price prediction for a device' })
  @ApiQuery({ name: 'brand', required: true })
  @ApiQuery({ name: 'model', required: true })
  @ApiQuery({ name: 'condition', required: false })
  async getPrediction(
    @Query('brand') brand: string,
    @Query('model') model: string,
    @Query('condition') condition?: string,
  ) {
    return this.aiPricingService.getPricePrediction(brand, model, condition);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get overall market trends' })
  async getTrends() {
    return this.aiPricingService.getMarketAnalysis('trending', 'overview');
  }
}
