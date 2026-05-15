import { IsOptional, IsString } from 'class-validator';

export class GenerateSoapDto {
  @IsOptional()
  @IsString()
  modelName?: string;
}
