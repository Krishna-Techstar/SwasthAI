import { Severity } from '@swasthai/database';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class RecordAiPredictionDto {
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @IsString()
  modelName: string;

  @IsOptional()
  @IsString()
  modelVersion?: string;

  @IsOptional()
  @IsString()
  classification?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsEnum(Severity)
  severity?: Severity;

  @IsObject()
  prediction: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  heatmapFileId?: string;

  @IsOptional()
  @IsUUID()
  segmentationMaskFileId?: string;

  @IsOptional()
  @IsUUID()
  contourMapFileId?: string;

  @IsOptional()
  @IsUUID()
  shapFileId?: string;

  @IsOptional()
  @IsObject()
  shapExplanation?: Record<string, unknown>;
}
