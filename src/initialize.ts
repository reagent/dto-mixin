import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { ResourceNotFoundFilter } from './util/resource-not-found.filter';
import { ExcludingSerializer } from './util/excluding.serializer';

export async function initialize(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'test' ? false : new Logger(),
  });

  const options = new DocumentBuilder()
    .setTitle('OMG')
    .setDescription('Description')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({ forbidNonWhitelisted: true, whitelist: false }),
  );

  app.useGlobalFilters(new ResourceNotFoundFilter());
  app.useGlobalInterceptors(new ExcludingSerializer());

  return app;
}
