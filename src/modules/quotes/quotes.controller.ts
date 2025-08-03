import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from 'src/decorators/current-user-decorator';
import type { IUserInterface } from 'src/interfaces/users.interface';
import { QuoteDocument } from 'src/schemas/quote.schema';
import { AccessTokenGuard } from '../auth/guards/access-token-guard';
import { CreateQuoteDto } from './dtos/create-quote.dto';
import { UpdateQuoteByIdDto } from './dtos/update-quote-by-id.dto';
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
  ): Promise<QuoteDocument[]> {
    return await this.quotesService.findQuotes(user._id);
  }

  @Get('search-user-quotes')
  async searchUserQuotes(
    @CurrentUser() user: IUserInterface,
  ): Promise<QuoteDocument[]> {
    return await this.quotesService.findQuotesByOwnerId(user._id);
  }

  @Patch(':id')
  async updateQuoteById(
    @CurrentUser() user: IUserInterface,
    @Param('id') id: string,
    @Body() body: UpdateQuoteByIdDto,
  ): Promise<QuoteDocument> {
    return await this.quotesService.updateQuoteById(user._id, id, body);
  }

  @Delete(':id')
  async deleteQuoteById(
    @CurrentUser() user: IUserInterface,
    @Param('id') id: string,
  ): Promise<QuoteDocument> {
    return await this.quotesService.deleteQuoteById(user._id, id);
  }
}
