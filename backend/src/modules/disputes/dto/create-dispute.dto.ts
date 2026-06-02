import { IsString, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisputeReason } from '../entities/dispute.entity';

export class CreateDisputeDto {
  @ApiProperty()
  @IsUUID()
  transactionId: string;

  @ApiProperty({ enum: DisputeReason })
  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @ApiProperty()
  @IsString()
  description: string;
}
