import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { AuditLog } from '../audit/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, AuditLog])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
