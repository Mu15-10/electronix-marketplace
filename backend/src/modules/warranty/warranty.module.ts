import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarrantyController } from './warranty.controller';
import { WarrantyService } from './warranty.service';
import { Warranty } from './entities/warranty.entity';
import { WarrantyClaim } from './entities/warranty-claim.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warranty, WarrantyClaim])],
  controllers: [WarrantyController],
  providers: [WarrantyService],
  exports: [WarrantyService],
})
export class WarrantyModule {}
