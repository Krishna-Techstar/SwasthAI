import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class DrugCandidateDto {
  @IsOptional()
  @IsUUID()
  medicationId?: string;

  @IsOptional()
  @IsString()
  drugName?: string;
}

export class CheckDrugSafetyDto {
  @IsUUID()
  patientProfileId: string;

  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @IsOptional()
  @IsUUID()
  prescriptionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrugCandidateDto)
  drugs: DrugCandidateDto[];
}
