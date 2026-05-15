import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AiFollowUpSuggestionsDto {
  @IsUUID()
  patientProfileId: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;
}
