import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class SearchQuotesDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
