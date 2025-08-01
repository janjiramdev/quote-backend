import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ContextRequest } from 'src/interfaces/interceptors.interface';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('IncomingConnection');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextRequest = context.switchToHttp().getRequest<ContextRequest>();
    const { method, url, params, query, body } = contextRequest;
    const requestTimestamp = Date.now();

    let message = `Request: [${method}] ${url}`;
    if (params && Object.keys(params).length)
      message += `, params: ${JSON.stringify(params)}`;
    if (query && Object.keys(query).length)
      message += `, query: ${JSON.stringify(query)}`;
    if (body) message += `, body: ${JSON.stringify(body)}`;

    this.logger.log(message);

    return next.handle().pipe(
      tap((responseData: unknown) => {
        const responseTimeDuration = Date.now() - requestTimestamp;
        this.logger.log(
          `Response: time: ${responseTimeDuration} ms, content: ${JSON.stringify(responseData)}`,
        );
      }),
      catchError((error: unknown) => {
        const responseTimeDuration = Date.now() - requestTimestamp;

        if (error instanceof Error)
          this.logger.error(
            `Response: time: ${responseTimeDuration} ms, error: ${error.message}`,
          );
        else
          this.logger.error(
            `Response: time: ${responseTimeDuration} ms, error: ${JSON.stringify(error)}`,
          );

        return throwError(() => error);
      }),
    );
  }
}
