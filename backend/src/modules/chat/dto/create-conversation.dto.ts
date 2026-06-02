import { IsArray, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty()
  @IsArray()
  @IsUUID('all', { each: true })
  participantIds: string[];

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  listingId?: string;
}
