import { IsString, IsNumber, IsEnum, ValidateNested, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
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

export class CalculateCostDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => DimensionsDto)
  dimensions: DimensionsDto;

  @ApiProperty()
  @IsString()
  fromAddress: string;

  @ApiProperty()
  @IsString()
  toAddress: string;

  @ApiProperty({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;
}
