import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AutoBidDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  maxAmount: number;
}
