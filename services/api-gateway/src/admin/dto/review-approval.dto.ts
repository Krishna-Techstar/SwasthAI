import { IsOptional, IsString } from 'class-validator';

export class ReviewApprovalDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
