import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/decorators/current-user-decorator';
import type { IUserInterface } from 'src/interfaces/users.interface';
import { AccessTokenGuard } from '../auth/guards/access-token-guard';
import { UpdateUserByIdDto } from './dtos/update-user-by-id.dto';
import { UsersService } from './users.service';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/profile')
  async getProfile(
    @CurrentUser() user: IUserInterface,
  ): Promise<IUserInterface> {
    return await this.usersService.getProfile(user._id);
  }

  @Patch('/update-profile')
  async updateProfile(
    @CurrentUser() user: IUserInterface,
    @Body() body: UpdateUserByIdDto,
  ): Promise<IUserInterface> {
    return await this.usersService.updateProfile(user._id, body);
  }
}
