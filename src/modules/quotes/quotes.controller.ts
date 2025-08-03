import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/decorators/current-user-decorator';
import type { IUserInterface } from 'src/interfaces/users.interface';
import { IPaginatedResponse } from 'src/interfaces/utils.interface';
import { QuoteDocument } from 'src/schemas/quote.schema';
import { AccessTokenGuard } from '../auth/guards/access-token-guard';
import { CreateQuoteDto } from './dtos/create-quote.dto';
import { SearchQuotesDto } from './dtos/search-quotes.dto';
import { QuotesService } from './quotes.service';

@UseGuards(AccessTokenGuard)
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  async createQuote(
    @CurrentUser() user: IUserInterface,
    @Body() body: CreateQuoteDto,
  ): Promise<QuoteDocument> {
    return await this.quotesService.createQuote(user._id, body);
  }

  @Get('search')
  async searchAllQuotes(
    @CurrentUser() user: IUserInterface,
    @Query() query: SearchQuotesDto,
  ): Promise<IPaginatedResponse<QuoteDocument>> {
    return await this.quotesService.findQuotes(user._id, query);
  }

  @Get('search-user-quotes')
  async searchUserQuotes(
    @CurrentUser() user: IUserInterface,
    @Query() query: SearchQuotesDto,
  ): Promise<IPaginatedResponse<QuoteDocument>> {
    return await this.quotesService.findQuotesByOwnerId(user._id, query);
  }

  @Delete(':id')
  async deleteQuoteById(
    @CurrentUser() user: IUserInterface,
    @Param('id') id: string,
  ): Promise<QuoteDocument> {
    return await this.quotesService.deleteQuoteById(user._id, id);
  }
}
