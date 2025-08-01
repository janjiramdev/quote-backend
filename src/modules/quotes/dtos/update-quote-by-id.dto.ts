import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateQuoteByIdDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
