import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/decorators/current-user-decorator';
import { IAuthTokens } from 'src/interfaces/auth.interface';
import type { IUserInterface } from 'src/interfaces/users.interface';
import { UserDocument } from 'src/schemas/user.schema';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token-guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { SignInDto } from './dtos/signin.dto';
import { SignUpDto } from './dtos/singup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: SignUpDto): Promise<UserDocument> {
    return await this.authService.signUp(body);
  }

  @Post('signin')
  async signIn(@Body() body: SignInDto): Promise<{ accessToken: string }> {
    return await this.authService.signIn(body);
  }

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  async signout(@CurrentUser() user: IUserInterface): Promise<string> {
    return await this.authService.signout(user._id);
  }

  @Post('refresh-token')
  async refresh(@Body() body: RefreshTokenDto): Promise<IAuthTokens> {
    return await this.authService.refreshToken(body);
  }
}
