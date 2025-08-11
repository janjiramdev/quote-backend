import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, SortOrder, Types } from 'mongoose';
import { IUpdateQuoteTotalVotesByIdInput } from 'src/interfaces/quotes.interface';
import { IPaginatedResponse } from 'src/interfaces/utils.interface';
import { Quote, QuoteDocument } from 'src/schemas/quote.schema';
import { VotesService } from '../votes/votes.service';
import { CreateQuoteDto } from './dtos/create-quote.dto';
import { SearchQuotesDto } from './dtos/search-quotes.dto';

@Injectable()
export class QuotesService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Quote.name) private readonly quoteModel: Model<Quote>,
    @Inject(forwardRef(() => VotesService)) private votesService: VotesService,
  ) {
    this.logger = new Logger(QuotesService.name);
  }

  async createQuote(
    ownerId: string,
    input: CreateQuoteDto,
  ): Promise<QuoteDocument> {
    return await this.quoteModel.create({
      ...input,
      totalVotes: 0,
      ownerId: new Types.ObjectId(ownerId),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  async findQuotes(
    userId: string,
    query: SearchQuotesDto,
  ): Promise<IPaginatedResponse<QuoteDocument>> {
    try {
      const {
        search,
        sortBy = 'createdAt',
        sortDirection = -1,
        page = 1,
        limit = 10,
      } = query;

      const filter = {
        ...(search && { content: { $regex: search, $options: 'i' } }),
        ownerId: { $ne: new Types.ObjectId(userId) },
        deletedAt: null,
      };
      const sort: [string, SortOrder][] = [
        [sortBy, sortDirection as SortOrder],
      ];
      const skip = (page - 1) * limit;

      const [items, totalItems] = await Promise.all([
        this.quoteModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.quoteModel.countDocuments(filter),
      ]);

      return {
        items,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async findQuotesByOwnerId(
    userId: string,
    query: SearchQuotesDto,
  ): Promise<IPaginatedResponse<QuoteDocument>> {
    try {
      const {
        search,
        sortBy = 'createdAt',
        sortDirection = -1,
        page = 1,
        limit = 10,
      } = query;

      const filter = {
        ...(search && { content: { $regex: search, $options: 'i' } }),
        ownerId: new Types.ObjectId(userId),
        deletedAt: null,
      };
      const sort: [string, SortOrder][] = [
        [sortBy, sortDirection as SortOrder],
      ];
      const skip = (page - 1) * limit;

      const [items, totalItems] = await Promise.all([
        this.quoteModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
        this.quoteModel.countDocuments(filter),
      ]);

      return {
        items,
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      };
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async findQuoteById(id: string): Promise<QuoteDocument | null | undefined> {
    return await this.quoteModel
      .findOne({ _id: new Types.ObjectId(id), deletedAt: null })
      .exec();
  }

  async updateQuoteTotalVotesById(
    input: IUpdateQuoteTotalVotesByIdInput,
  ): Promise<QuoteDocument> {
    const { id, totalVotes } = input;

    const quote = await this.findQuoteById(id);
    if (!quote) throw new NotFoundException(`quote with id: ${id} not found`);

    quote.totalVotes = totalVotes;
    quote.updatedAt = new Date();
    return await quote.save();
  }

  async deleteQuoteById(userId: string, id: string): Promise<QuoteDocument> {
    try {
      if (!isValidObjectId(id))
        throw new BadRequestException(`invalid quote id format: ${id}`);

      const quote = await this.findQuoteById(id);
      if (!quote) throw new NotFoundException(`quote with id: ${id} not found`);
      if (quote.ownerId.toString() !== userId)
        throw new ForbiddenException(
          `user with id: ${userId} does not belongs to quote with id: ${id}`,
        );

      await this.votesService.deleteVotesByQuoteId(id);

      quote.deletedAt = new Date();
      return await quote.save();
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
