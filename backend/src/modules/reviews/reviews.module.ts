import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { Listing } from '../listings/entities/listing.entity';
import { EscrowTransaction } from '../escrow/entities/escrow.entity';
import { AuditLog } from '../audit/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Listing, EscrowTransaction, AuditLog])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
