import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiPricingController } from './ai-pricing.controller';
import { AiPricingService } from './ai-pricing.service';
import { PriceAnalysis } from './entities/price-analysis.entity';
import { Listing } from '../listings/entities/listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceAnalysis, Listing])],
  controllers: [AiPricingController],
  providers: [AiPricingService],
  exports: [AiPricingService],
})
export class AiPricingModule {}
