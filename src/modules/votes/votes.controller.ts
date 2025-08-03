import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DeleteResult } from 'mongoose';
import { CurrentUser } from 'src/decorators/current-user-decorator';
import type { IUserInterface } from 'src/interfaces/users.interface';
import { VoteDocument } from 'src/schemas/vote.schema';
import { AccessTokenGuard } from '../auth/guards/access-token-guard';
import { VoteQuoteDto } from './dtos/vote-quote.dto';
import { VotesService } from './votes.service';

@UseGuards(AccessTokenGuard)
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  async voteQuote(
    @CurrentUser() user: IUserInterface,
    @Body() body: VoteQuoteDto,
  ): Promise<VoteDocument | DeleteResult> {
    return await this.votesService.voteQuote(user._id, body);
  }

  @Get('user-vote')
  async getUserVote(@CurrentUser() user: IUserInterface) {
    return await this.votesService.getUserVote(user._id);
  }
}
