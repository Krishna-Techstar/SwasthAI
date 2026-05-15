import { RadiologyScanType } from '@swasthai/database';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRadiologyUploadDto {
  @IsUUID()
  patientProfileId: string;

  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @IsUUID()
  fileId: string;

  @IsEnum(RadiologyScanType)
  scanType: RadiologyScanType;

  @IsOptional()
  @IsString()
  bodyRegion?: string;

  @IsOptional()
  @IsBoolean()
  queueAi?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
