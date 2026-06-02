import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FraudAlertStatus } from '../entities/fraud-alert.entity';

export class ResolveAlertDto {
  @ApiProperty({ enum: FraudAlertStatus })
  @IsEnum(FraudAlertStatus)
  status: FraudAlertStatus;

  @ApiProperty()
  @IsString()
  resolution: string;
}
