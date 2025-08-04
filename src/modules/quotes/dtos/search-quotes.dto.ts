import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class SearchQuotesDto {
  @IsOptional()
  search?: string;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  @Type(() => Number)
  sortDirection?: number;

  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
