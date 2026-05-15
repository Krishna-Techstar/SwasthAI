import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class AddVitalDto {
  @IsString()
  type: string;

  @Type(() => Number)
  @IsNumber()
  value: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  measuredAt?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
