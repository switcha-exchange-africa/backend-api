import { Controller, Get, Req } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { env } from 'src/configuration';
import { CustomLogger } from 'src/core/entities/CustomLogger';
import { HomeServices } from 'src/services/use-cases/home/home.service';
import { Request } from "express"
import { CustomLoggerOperationType, CustomLoggerType } from 'src/core/dtos/custom-logger';
@Controller()
export class HomeController {
  constructor(
    private readonly service: HomeServices,
    private emitter: EventEmitter2
  ) { }

  @Get('/health')
  health(@Req() req: Request): string {
    const { method, originalUrl } = req;

    this.emitter.emit("log.entry", {
      endpoint: originalUrl,
      statusCode: '200',
      method,
      operation: '',
      message: `called ${originalUrl}`,
      ip: (req.headers['x-forwarded-for'] as string || '').split(',').pop().trim() || req.socket.remoteAddress,
      type: CustomLoggerType.SUCCESS,
      // error: CustomLoggerErrorType,
      operationType: CustomLoggerOperationType.INTERNAL,

    } as CustomLogger)

    return this.service.health();
  }

  @Get('/name')
  name(): string {
    return `${env.env.toUpperCase()} API`;
  }
}
