import { IsNotEmpty, IsString } from 'class-validator';

export class VoteQuoteDto {
  @IsNotEmpty()
  @IsString()
  quoteId: string;
}
