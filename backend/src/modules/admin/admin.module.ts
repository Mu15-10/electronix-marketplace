import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { EscrowTransaction } from '../escrow/entities/escrow.entity';
import { Dispute } from '../disputes/entities/dispute.entity';
import { FraudAlert } from '../fraud/entities/fraud-alert.entity';
import { Verification } from '../verification/entities/verification.entity';
import { AuditLog } from '../audit/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, EscrowTransaction, Dispute, FraudAlert, Verification, AuditLog])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
