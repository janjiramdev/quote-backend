import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/decorators/current-user-decorator';
import type { IUserInterface } from 'src/interfaces/users.interface';
import { UserDocument } from 'src/schemas/user.schema';
import { AccessTokenGuard } from '../auth/guards/access-token-guard';
import { UpdateUserByIdDto } from './dtos/update-user-by-id.dto';
import { UsersService } from './users.service';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('/update-profile')
  async updateProfile(
    @CurrentUser() user: IUserInterface,
    @Body() body: UpdateUserByIdDto,
  ): Promise<UserDocument> {
    return await this.usersService.updateProfile(user._id, body);
  }
}
