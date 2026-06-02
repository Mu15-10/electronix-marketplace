import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class HardwareIssueDto {
  @ApiProperty()
  @IsString()
  component: string;

  @ApiProperty()
  @IsString()
  issue: string;

  @ApiProperty()
  @IsString()
  severity: string;
}

export class CompleteInspectionDto {
  @ApiProperty()
  @IsBoolean()
  deviceAuthenticity: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deviceCondition?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  batteryHealth?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  screenCondition?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cameraFunctionality?: string;

  @ApiPropertyOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HardwareIssueDto)
  @IsOptional()
  hardwareIssues?: HardwareIssueDto[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  imeiValid?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  serialValid?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  inspectionReport?: string;
}
