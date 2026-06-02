import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { dataSourceOptions } from './config/database.config';
import { CustomThrottlerGuard } from './common/guards/throttle.guard';

const hasRedis = !!(process.env.REDIS_HOST || process.env.REDIS_URL);

const bullImports: any[] = [];
if (hasRedis) {
  bullImports.push(BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: 1,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }));
}

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { ChatModule } from './modules/chat/chat.module';
import { EscrowModule } from './modules/escrow/escrow.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { FraudModule } from './modules/fraud/fraud.module';
import { VerificationModule } from './modules/verification/verification.module';
import { DeviceRecognitionModule } from './modules/device-recognition/device-recognition.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { AuditModule } from './modules/audit/audit.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { WarrantyModule } from './modules/warranty/warranty.module';
import { InspectionModule } from './modules/inspection/inspection.module';
import { AdvertisingModule } from './modules/advertising/advertising.module';
import { SupportModule } from './modules/support/support.module';
import { LiveCommerceModule } from './modules/live-commerce/live-commerce.module';
import { AuctionModule } from './modules/auction/auction.module';
import { AiPricingModule } from './modules/ai-pricing/ai-pricing.module';
import { MarketIntelligenceModule } from './modules/market-intelligence/market-intelligence.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { CommissionModule } from './modules/commission/commission.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ReferralModule } from './modules/referral/referral.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.production'],
    }),

    TypeOrmModule.forRoot(dataSourceOptions),

    ThrottlerModule.forRoot([{
      ttl: 900000,
      limit: 100,
    }]),

    ScheduleModule.forRoot(),

    CacheModule.register({
      isGlobal: true,
      ttl: 60000,
      max: 100,
    }),

    ...bullImports,

    AuthModule,
    UsersModule,
    ListingsModule,
    ChatModule,
    EscrowModule,
    PaymentsModule,
    NotificationsModule,
    SearchModule,
    FraudModule,
    VerificationModule,
    DeviceRecognitionModule,
    AdminModule,
    AnalyticsModule,
    DisputesModule,
    ReviewsModule,
    WishlistModule,
    ReportsModule,
    SellersModule,
    AuditModule,
    ShippingModule,
    WarrantyModule,
    InspectionModule,
    AdvertisingModule,
    SupportModule,
    LiveCommerceModule,
    AuctionModule,
    AiPricingModule,
    MarketIntelligenceModule,
    SubscriptionModule,
    CommissionModule,
    LoyaltyModule,
    ReferralModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
