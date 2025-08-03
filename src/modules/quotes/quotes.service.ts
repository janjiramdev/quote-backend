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
import { isValidObjectId, Model, Types } from 'mongoose';
import { IUpdateQuoteTotalVotesByIdInput } from 'src/interfaces/quotes.interface';
import { Quote, QuoteDocument } from 'src/schemas/quote.schema';
import { VotesService } from '../votes/votes.service';
import { CreateQuoteDto } from './dtos/create-quote.dto';
import { UpdateQuoteByIdDto } from './dtos/update-quote-by-id.dto';

@Injectable()
export class QuotesService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
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

  async findQuotes(userId: string): Promise<QuoteDocument[]> {
    return await this.quoteModel
      .find({
        ownerId: { $ne: new Types.ObjectId(userId) },
        deletedAt: null,
      })
      .sort([
        ['totalVotes', -1],
        ['createdAt', 1],
      ])
      .exec();
  }

  async findQuotesByOwnerId(userId: string): Promise<QuoteDocument[]> {
    return await this.quoteModel
      .find({ ownerId: new Types.ObjectId(userId), deletedAt: null })
      .sort([
        ['totalVotes', -1],
        ['createdAt', 1],
      ])
      .exec();
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

  async updateQuoteById(
    userId: string,
    id: string,
    input: UpdateQuoteByIdDto,
  ): Promise<QuoteDocument> {
    try {
      const { content } = input;

      if (!isValidObjectId(id))
        throw new BadRequestException(`invalid quote id format: ${id}`);

      const quote = await this.findQuoteById(id);
      if (!quote) throw new NotFoundException(`quote with id: ${id} not found`);
      if (quote.ownerId.toString() !== userId)
        throw new ForbiddenException(
          `user with id: ${userId} does not belongs to quote with id: ${id}`,
        );

      quote.content = content;
      quote.updatedAt = new Date();
      return await quote.save();
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
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
