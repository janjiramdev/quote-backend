import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ExceptionResponseObject } from 'src/interfaces/filters.interface';

@Catch()
export class ResponseExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const contextRequest = host.switchToHttp().getRequest<Request>();
    const contextResponse = host.switchToHttp().getResponse<Response>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const formattedExceptionResponse =
          exceptionResponse as ExceptionResponseObject;
        if (formattedExceptionResponse.message)
          message = formattedExceptionResponse.message;
      } else if (typeof exceptionResponse === 'string')
        message = exceptionResponse;
    }

    contextResponse.status(status).json({
      timestamp: Date.now(),
      path: contextRequest.url,
      success: false,
      statusCode: status,
      message,
    });
  }
}
