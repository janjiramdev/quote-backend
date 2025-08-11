import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, Model, Types } from 'mongoose';
import { Vote, VoteDocument } from 'src/schemas/vote.schema';
import { QuotesService } from '../quotes/quotes.service';
import { VoteQuoteDto } from './dtos/vote-quote.dto';

@Injectable()
export class VotesService {
  private readonly logger: Logger;

  constructor(
    @InjectModel(Vote.name) private voteModel: Model<Vote>,
    @Inject(forwardRef(() => QuotesService))
    private quotesService: QuotesService,
  ) {
    this.logger = new Logger(VotesService.name);
  }

  async voteQuote(
    userId: string,
    input: VoteQuoteDto,
  ): Promise<VoteDocument | DeleteResult> {
    try {
      const { quoteId } = input;

      if (!Types.ObjectId.isValid(quoteId))
        throw new BadRequestException(`invalid quoteId format: ${quoteId}`);

      const quote = await this.quotesService.findQuoteById(quoteId);
      if (!quote)
        throw new NotFoundException(`quote with id ${quoteId} not found`);
      if (quote.ownerId.toString() === userId)
        throw new BadRequestException(`user cannot vote their own quote`);

      const existingVote = await this.voteModel.findOne({
        userId: new Types.ObjectId(userId),
      });

      if (existingVote) {
        const currentVotedQuote = await this.quotesService.findQuoteById(
          existingVote.quoteId.toString(),
        );
        if (!currentVotedQuote)
          throw new InternalServerErrorException(
            `invalid quote data, quote of existing vote not found`,
          );

        await this.quotesService.updateQuoteTotalVotesById({
          id: currentVotedQuote._id.toString(),
          totalVotes: currentVotedQuote.totalVotes - 1,
        });

        await this.voteModel.deleteOne({ _id: existingVote._id });

        if (currentVotedQuote._id.toString() === quoteId) {
          return existingVote;
        }
      }

      await this.quotesService.updateQuoteTotalVotesById({
        id: quoteId,
        totalVotes: quote.totalVotes + 1,
      });

      return await this.voteModel.create({
        userId: new Types.ObjectId(userId),
        quoteId: new Types.ObjectId(quoteId),
        createdAt: new Date(),
      });
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ?? error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async getUserVote(userId: string): Promise<VoteDocument | null | undefined> {
    return await this.voteModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('quoteId')
      .exec();
  }

  async deleteVotesByQuoteId(input: string): Promise<DeleteResult> {
    return await this.voteModel.deleteMany({
      quoteId: new Types.ObjectId(input),
    });
  }
}
