import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class MarketHistoryQueryDto {
  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiPropertyOptional({ default: 30 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  days?: number;
}
