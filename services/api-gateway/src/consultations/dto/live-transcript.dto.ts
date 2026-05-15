import { Role } from '@swasthai/database';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class LiveTranscriptDto {
  @IsOptional()
  @IsEnum(Role)
  speakerRole?: Role;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  sequence: number;

  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  isFinal?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsString()
  aiProvider?: string;
}
