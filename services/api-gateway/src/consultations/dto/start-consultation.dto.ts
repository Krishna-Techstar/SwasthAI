import { IsOptional, IsString, IsUUID } from 'class-validator';

export class StartConsultationDto {
  @IsUUID()
  patientProfileId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsUUID()
  hospitalId?: string;

  @IsOptional()
  @IsString()
  chiefComplaint?: string;
}
