import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ContextRequest,
  ContextResponse,
} from 'src/interfaces/interceptors.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const contextRequest = context.switchToHttp().getRequest<ContextRequest>();
    const contextResponse = context
      .switchToHttp()
      .getResponse<ContextResponse>();

    return next.handle().pipe(
      map((data: unknown) => {
        return {
          timestamp: Date.now(),
          path: contextRequest.url,
          success: true,
          statusCode: contextResponse.statusCode,
          data,
        };
      }),
    );
  }
}
