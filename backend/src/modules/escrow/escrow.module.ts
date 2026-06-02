import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowController } from './escrow.controller';
import { EscrowService } from './escrow.service';
import { EscrowTransaction } from './entities/escrow.entity';
import { Listing } from '../listings/entities/listing.entity';
import { AuditLog } from '../audit/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EscrowTransaction, Listing, AuditLog])],
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}
