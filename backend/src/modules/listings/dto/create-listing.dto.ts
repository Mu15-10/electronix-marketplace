import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsBoolean, Min, Max, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DeviceCondition, ListingType } from '../entities/listing.entity';

export class CreateListingDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  price: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ enum: DeviceCondition })
  @IsEnum(DeviceCondition)
  condition: DeviceCondition;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  variant?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  storageCapacity?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isBoxed?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  hasAccessories?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  accessoriesDescription?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: { url: string; isPrimary?: boolean }[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isShippingAvailable?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryName?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  specifications?: Record<string, string>;
}
