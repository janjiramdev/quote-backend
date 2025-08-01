import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuoteDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
