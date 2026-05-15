import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CompleteSoapJobDto {
  @IsUUID()
  jobId: string;

  @IsOptional()
  @IsString()
  modelName?: string;

  @IsObject()
  soap: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };

  @IsOptional()
  @IsObject()
  confidence?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  insights?: Record<string, unknown>;
}
