import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ListConsultationsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;
}
