import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class BodyMapPointDto {
  @IsString()
  region: string;

  @IsOptional()
  @IsString()
  side?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  x?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  y?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  painScore?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class SaveBodyMapDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BodyMapPointDto)
  points: BodyMapPointDto[];
}
