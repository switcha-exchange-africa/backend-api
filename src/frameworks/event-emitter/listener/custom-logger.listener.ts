import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { IDataServices } from "src/core/abstracts";
import { CustomLogger } from "src/core/entities/CustomLogger";
import { CustomLoggerFactoryServices } from "src/services/use-cases/customer-logger/custom-logger-factory.services";

@Injectable()
export class CustomLoggerListener {
  constructor(
    private data: IDataServices,
    private factory: CustomLoggerFactoryServices
  ) {

  }
  @OnEvent('log.entry', { async: true })
  async logEntry(event: CustomLogger) {
    try {
      const factory = await this.factory.create(event)
      await this.data.customLogger.create(factory)
      Logger.log('Log entry taken')
    } catch (e) {
      Logger.error(e)
    }
  }

} 