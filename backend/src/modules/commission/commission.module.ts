import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionController } from './commission.controller';
import { CommissionService } from './commission.service';
import { CommissionConfig } from './entities/commission-config.entity';
import { CommissionTransaction } from './entities/commission-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommissionConfig, CommissionTransaction])],
  controllers: [CommissionController],
  providers: [CommissionService],
  exports: [CommissionService],
})
export class CommissionModule {}
