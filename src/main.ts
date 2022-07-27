import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env, LOGS_LEVEL, PORT } from './configuration';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import CustomLogger from './services/use-cases/customer-logger/custom-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // bufferLogs: true,
    logger: LOGS_LEVEL(),

  });
  // app.useLogger(app.get(CustomLogger));


  const options = new DocumentBuilder()
    .setTitle(`Switcha ${env.env} Api`)
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
    .then(() => Logger.log(`server running on port ${PORT}`))
}
bootstrap();

