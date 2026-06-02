import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvertisingController } from './advertising.controller';
import { AdvertisingService } from './advertising.service';
import { Campaign } from './entities/campaign.entity';
import { Advertisement } from './entities/advertisement.entity';
import { AuditLog } from '../audit/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, Advertisement, AuditLog])],
  controllers: [AdvertisingController],
  providers: [AdvertisingService],
  exports: [AdvertisingService],
})
export class AdvertisingModule {}
