import { IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScheduleInspectionDto {
  @ApiProperty()
  @IsUUID()
  listingId: string;

  @ApiProperty()
  @IsUUID()
  inspectorId: string;

  @ApiProperty()
  @IsDateString()
  scheduledAt: string;
}
