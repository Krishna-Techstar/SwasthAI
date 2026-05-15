import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SearchPatientsDto extends PaginationDto {
  @IsString()
  q: string;

  @IsOptional()
  @IsString()
  hospitalId?: string;
}
