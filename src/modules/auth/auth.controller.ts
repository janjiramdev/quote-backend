import { Body, Controller, Post } from '@nestjs/common';
import { UserDocument } from 'src/schemas/user.schema';
import { AuthService } from './auth.service';
import { SigninDto } from './dtos/signin.dto';
import { SignupDto } from './dtos/singup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupDto): Promise<UserDocument> {
    return await this.authService.signup(body);
  }

  @Post('signin')
  async signin(@Body() body: SigninDto): Promise<{ accessToken: string }> {
    return await this.authService.signin(body);
  }
}
