import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PriceSuggestionQueryDto {
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
  condition?: string;
}
