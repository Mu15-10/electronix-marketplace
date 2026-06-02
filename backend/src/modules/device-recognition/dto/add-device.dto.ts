import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddDeviceDto {
  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  variant?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  generation?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  releaseYear?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displaySize?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  processor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ram?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  storageOptions?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  operatingSystem?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  colors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  marketPrices?: { condition: string; minPrice: number; maxPrice: number; averagePrice: number }[];
}
