import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  CJwtExpiredErrorMessage,
  CJwtInvalidErrorMessage,
} from 'src/constants/jwt.constant';
import { IAuthTokenDetail, IAuthTokens } from 'src/interfaces/auth.interface';
import { ICreateUserInput } from 'src/interfaces/users.interface';
import { UserDocument } from 'src/schemas/user.schema';
import { EncodeUtil } from 'src/utils/encode.util';
import { UsersService } from '../users/users.service';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
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

  async signIn(input: SignInDto): Promise<IAuthTokens> {
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

      const tokens = await this.generateTokens(user);
      await this.usersService.updateUserRefreshToken({
        _id: String(user._id),
        refreshToken: this.encodeUtil.hashData(tokens.refreshToken),
      });

      return tokens;
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  async signout(input: string): Promise<string> {
    try {
      const user = await this.usersService.findUserById(input);
      if (!user)
        throw new NotFoundException(`user with username: ${input} not found`);

      await this.usersService.updateUserRefreshToken({
        _id: String(user._id),
        refreshToken: '',
      });

      return 'signout successful';
    } catch (error: unknown) {
      if (error instanceof Error)
        this.logger.error(error.stack ? error.stack : error.message);
      else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  private async generateTokens(input: UserDocument): Promise<IAuthTokens> {
    const { _id, username, displayName } = input;

    const accessToken = await this.jwtService.signAsync(
      { sub: _id, username, displayName },
      {
        secret: this.configService.get<string>('jwt.accessTokenSecret'),
        expiresIn: this.configService.get<string>('jwt.accessTokenExpireTime'),
        algorithm: 'HS512',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: _id, username, displayName },
      {
        secret: this.configService.get<string>('jwt.refreshTokenSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshTokenExpireTime'),
        algorithm: 'HS512',
      },
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(input: RefreshTokenDto): Promise<IAuthTokens> {
    const { refreshToken } = input;

    try {
      const decodedToken: IAuthTokenDetail = await this.jwtService.verifyAsync(
        refreshToken,
        {
          ignoreExpiration: false,
          secret: this.configService.get<string>('jwt.refreshTokenSecret'),
          algorithms: ['HS512'],
        },
      );

      const user = await this.usersService.findUserById(decodedToken.sub);
      if (!user)
        throw new NotFoundException(
          `user with username: ${decodedToken.sub} not found`,
        );
      else if (!user.refreshToken) throw new UnauthorizedException();

      const tokenCorrected = this.encodeUtil.compareData(
        refreshToken,
        user.refreshToken,
      );
      if (!tokenCorrected) throw new UnauthorizedException('invalid session');

      const tokens = await this.generateTokens(user);
      await this.usersService.updateUserRefreshToken({
        _id: String(user._id),
        refreshToken: this.encodeUtil.hashData(tokens.refreshToken),
      });

      return tokens;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(error.stack ? error.stack : error.message);

        if (error.message === CJwtExpiredErrorMessage)
          throw new UnauthorizedException('session expired');
        else if (error.message === CJwtInvalidErrorMessage)
          throw new UnauthorizedException('invalid session');
        else throw error;
      } else this.logger.error(`Error: ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
