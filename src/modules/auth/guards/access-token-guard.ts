import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContextRequest } from 'src/interfaces/interceptors.interface';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(AccessTokenGuard.name);

  handleRequest<T>(
    err: Error,
    user: T,
    info: { message: string },
    context: ExecutionContext,
  ): T {
    const contextRequest = context.switchToHttp().getRequest<ContextRequest>();
    const { method, url } = contextRequest;

    if (err || !user) {
      const errorMessage = info?.message ?? 'invalid authorization';
      this.logger.error(
        `Unauthorized access on [${method}] ${url}, reason: ${errorMessage}`,
      );
      throw new UnauthorizedException(errorMessage);
    }

    return user;
  }
}
