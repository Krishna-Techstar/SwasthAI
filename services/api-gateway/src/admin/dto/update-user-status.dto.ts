import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '@swasthai/database';

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
