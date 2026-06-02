import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveCommerceController } from './live-commerce.controller';
import { LiveCommerceService } from './live-commerce.service';
import { LiveStream } from './entities/live-stream.entity';
import { AuditLog } from '../audit/entities/audit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LiveStream, AuditLog])],
  controllers: [LiveCommerceController],
  providers: [LiveCommerceService],
  exports: [LiveCommerceService],
})
export class LiveCommerceModule {}
