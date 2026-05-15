import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, UserStatus } from '@swasthai/database';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListUsersDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
