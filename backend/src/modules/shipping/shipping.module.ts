import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';
import { Shipping } from './entities/shipping.entity';
import { ShippingProvider } from './entities/shipping-provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipping, ShippingProvider])],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
