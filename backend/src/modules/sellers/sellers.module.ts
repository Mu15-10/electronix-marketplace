import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';
import { Seller } from './entities/seller.entity';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Review } from '../reviews/entities/review.entity';
import { EscrowTransaction } from '../escrow/entities/escrow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seller, User, Listing, Review, EscrowTransaction])],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
