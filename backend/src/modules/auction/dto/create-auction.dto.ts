import { IsNumber, IsOptional, IsBoolean, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuctionDto {
  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  startPrice: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  reservePrice?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  minBidIncrement?: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  autoExtend?: boolean;

  @ApiPropertyOptional({ default: 5 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  extensionMinutes?: number;
}
