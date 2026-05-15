import { AppointmentType, ReminderChannel, UrgencyLevel } from '@swasthai/database';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  patientProfileId: string;

  @IsUUID()
  doctorId: string;

  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @IsOptional()
  @IsUUID()
  hospitalId?: string;

  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @IsOptional()
  @IsEnum(UrgencyLevel)
  urgency?: UrgencyLevel;

  @IsString()
  scheduledStart: string;

  @IsString()
  scheduledEnd: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ReminderChannel, { each: true })
  reminderChannels?: ReminderChannel[];
}

export class CreateReminderDto {
  @IsEnum(ReminderChannel)
  channel: ReminderChannel;
}
