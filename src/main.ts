import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PORT } from './configuration';
import {allEvents} from './core/custom-events/eventEmitter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn','log','debug','verbose'],
  });

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(PORT);
}
bootstrap();
allEvents()
