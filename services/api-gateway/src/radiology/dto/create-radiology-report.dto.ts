import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRadiologyReportDto {
  @IsOptional()
  @IsUUID()
  aiPredictionId?: string;

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsString()
  impression?: string;

  @IsOptional()
  @IsString()
  recommendation?: string;

  @IsOptional()
  @IsBoolean()
  aiGenerated?: boolean;
}
