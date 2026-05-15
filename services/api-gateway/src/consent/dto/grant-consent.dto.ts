import { IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class GrantConsentDto {
  @IsUUID()
  patientProfileId: string;

  @IsOptional()
  @IsUUID()
  consultationId?: string;

  @IsString()
  consentVersion: string;

  @IsObject()
  scope: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  sessionInfo?: Record<string, unknown>;
}
