import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configSwagger = new DocumentBuilder()
    .setTitle('Rootstock Explorer API')
    .setDescription('Rootstock Explorer API v3')
    .setVersion('3.0.0')
    .addTag('rsk-explorer')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('doc', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
