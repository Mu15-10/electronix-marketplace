import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyPoints } from './entities/loyalty-points.entity';
import { LoyaltyReward } from './entities/loyalty-reward.entity';
import { UserLoyalty } from './entities/user-loyalty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyPoints, LoyaltyReward, UserLoyalty])],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
