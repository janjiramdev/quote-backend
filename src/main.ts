import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import systemConfig from './configs/system.config';
import { ResponseExceptionsFilter } from './filters/response-exception-filter';
import { LoggerInterceptor } from './interceptors/logger-interceptor';
import { ResponseInterceptor } from './interceptors/response-interceptor';

const configs = systemConfig();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: configs.system.corsAllowOrigin,
    credentials: true,
  });

  app.useGlobalFilters(new ResponseExceptionsFilter());
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(configs.system.appPort);
}
void bootstrap();
