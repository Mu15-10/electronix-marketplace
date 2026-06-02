import { IsString, IsUUID, IsEnum, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WarrantyType } from '../entities/warranty.entity';

export class CreateWarrantyDto {
  @ApiProperty()
  @IsUUID()
  listingId: string;

  @ApiProperty()
  @IsUUID()
  sellerId: string;

  @ApiProperty()
  @IsUUID()
  buyerId: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  transactionId?: string;

  @ApiProperty({ enum: WarrantyType })
  @IsEnum(WarrantyType)
  type: WarrantyType;

  @ApiProperty()
  @IsString()
  coverage: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  durationMonths: number;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  termsUrl?: string;
}
