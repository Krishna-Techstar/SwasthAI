import { FileCategory, StorageProvider } from '@swasthai/database';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUploadSignatureDto {
  @IsEnum(StorageProvider)
  provider: StorageProvider;

  @IsEnum(FileCategory)
  category: FileCategory;

  @IsString()
  fileName: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  sizeBytes: number;

  @IsOptional()
  @IsUUID()
  patientProfileId?: string;

  @IsOptional()
  @IsUUID()
  consultationId?: string;
}
