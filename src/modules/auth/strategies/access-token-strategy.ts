import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IAuthTokenDetail } from 'src/interfaces/auth.interface';
import { IUserInterface } from 'src/interfaces/user.interface';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessTokenSecret') as string,
      algorithms: ['HS512'],
    });
  }

  validate(payload: IAuthTokenDetail): IUserInterface {
    return {
      _id: payload.sub,
      username: payload.username,
      displayName: payload.displayName,
    };
  }
}
