import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ICreateUserInput } from 'src/interfaces/users.interface';
import { UserDocument } from 'src/schemas/user.schema';
import { EncodeUtil } from 'src/utils/encode.util';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dtos/signin.dto';
import { SignUpDto } from './dtos/singup.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  private readonly encodeUtil: EncodeUtil;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.logger = new Logger(AuthService.name);
    this.encodeUtil = new EncodeUtil();
  }

  async signUp(input: SignUpDto): Promise<UserDocument> {
    const { username, displayName, password } = input;

    try {
      const existingUser = await this.usersService.findUserByUsername(username);
      if (existingUser)
        throw new BadRequestException(
          `user with username: ${username} already exits`,
        );

      const user: ICreateUserInput = {
        username,
        displayName,
        password: this.encodeUtil.hashData(password),
      };

      return await this.usersService.createUser(user);
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async signIn(input: SignInDto): Promise<{ accessToken: string }> {
    const { username, password } = input;

    try {
      const user = await this.usersService.findUserByUsername(username);
      if (!user)
        throw new NotFoundException(
          `user with username: ${username} not found`,
        );

      const passwordCorrected = this.encodeUtil.compareData(
        password,
        user.password,
      );
      if (!passwordCorrected) throw new BadRequestException('invalid password');

      const accessToken = await this.generateAccessToken(user);

      return accessToken;
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  private async generateAccessToken(
    input: UserDocument,
  ): Promise<{ accessToken: string }> {
    const { _id, username, displayName } = input;

    const accessToken = await this.jwtService.signAsync(
      { sub: _id, username, displayName },
      {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
        expiresIn: this.configService.get<string>('jwt.accessTokenExpireTime'),
        algorithm: 'HS512',
      },
    );

    return { accessToken };
  }
}
