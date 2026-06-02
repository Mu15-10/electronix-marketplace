import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { EscrowTransaction } from '../escrow/entities/escrow.entity';
import { FraudAlert } from '../fraud/entities/fraud-alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, EscrowTransaction, FraudAlert])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
