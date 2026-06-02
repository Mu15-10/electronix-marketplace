import { IsString, IsNumber, IsUUID, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DeliveryType } from '../entities/shipping.entity';

class DimensionsDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  length: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  height: number;

  @ApiProperty({ default: 'cm' })
  @IsString()
  unit: string;
}

export class CreateShipmentDto {
  @ApiProperty()
  @IsUUID()
  transactionId: string;

  @ApiProperty()
  @IsString()
  provider: string;

  @ApiProperty()
  @IsString()
  senderName: string;

  @ApiProperty()
  @IsString()
  senderAddress: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  senderPhone?: string;

  @ApiProperty()
  @IsString()
  recipientName: string;

  @ApiProperty()
  @IsString()
  recipientAddress: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiPropertyOptional({ default: 'usd' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => DimensionsDto)
  @IsOptional()
  dimensions?: DimensionsDto;

  @ApiProperty({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  signatureRequired?: boolean;

  @ApiProperty()
  @IsUUID()
  senderId: string;

  @ApiProperty()
  @IsUUID()
  recipientId: string;
}
