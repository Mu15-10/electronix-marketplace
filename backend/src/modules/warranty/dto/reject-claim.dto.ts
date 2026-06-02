import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectClaimDto {
  @ApiProperty()
  @IsString()
  reason: string;
}
