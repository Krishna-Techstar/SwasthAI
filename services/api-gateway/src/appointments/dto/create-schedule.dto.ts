import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsUUID()
  providerId: string;

  @IsOptional()
  @IsUUID()
  hospitalId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  slotMinutes?: number;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
