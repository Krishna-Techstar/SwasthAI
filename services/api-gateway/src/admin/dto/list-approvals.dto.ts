import { ApprovalStatus, Role } from '@swasthai/database';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListApprovalsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ApprovalStatus)
  status?: ApprovalStatus;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
