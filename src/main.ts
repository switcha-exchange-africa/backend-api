import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env, PORT } from './configuration';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });


  const options = new DocumentBuilder()
    .setTitle('Switcha Api')
    .setDescription('Switcha API description')
    .setVersion('1.0')
    .addTag('cats')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  await app.listen(PORT)
    .then(() => Logger.log(`server running on port ${PORT} :- ENVIRONMENT ${env.env}`))
}
bootstrap();

