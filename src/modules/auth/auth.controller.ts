import { Body, Controller, Post } from '@nestjs/common';
import { UserDocument } from 'src/schemas/user.schema';
import { AuthService } from './auth.service';
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
}
