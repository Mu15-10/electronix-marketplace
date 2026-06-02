import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SchedulePickupDto {
  @ApiProperty()
  @IsDateString()
  pickupDate: string;

  @ApiProperty()
  @IsString()
  timeRange: string;
}
