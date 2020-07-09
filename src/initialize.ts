import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication, Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { ResourceNotFoundFilter } from './util/resource-not-found.filter';

export async function initialize(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'test' ? false : new Logger(),
  });

  app.useGlobalPipes(
    new ValidationPipe({ forbidNonWhitelisted: true, whitelist: false }),
  );

  app.useGlobalFilters(new ResourceNotFoundFilter());

  return app;
}
