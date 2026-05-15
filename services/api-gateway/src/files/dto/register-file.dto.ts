import { FileCategory, StorageProvider } from '@swasthai/database';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class RegisterFileDto {
  @IsEnum(StorageProvider)
  provider: StorageProvider;

  @IsOptional()
  @IsString()
  bucket?: string;

  @IsString()
  storageKey: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  secureUrl?: string;

  @IsOptional()
  @IsString()
  publicId?: string;

  @IsOptional()
  @IsString()
  etag?: string;

  @IsOptional()
  @IsString()
  checksum?: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  sizeBytes: number;

  @IsEnum(FileCategory)
  category: FileCategory;

  @IsOptional()
  @IsUUID()
  patientProfileId?: string;

  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
