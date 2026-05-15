import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateSoapReportDto {
  @IsOptional()
  @IsString()
  subjective?: string;

  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsString()
  assessment?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;

  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsObject()
  confidence?: Record<string, unknown>;
}
