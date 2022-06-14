import { Module } from "@nestjs/common";
import { CustomLoggerFactoryServices } from './custom-logger-factory.services';
import CustomLogger from "./custom-logger.service";

@Module({
  imports: [],
  providers: [CustomLoggerFactoryServices, CustomLogger],
  exports: [CustomLoggerFactoryServices, CustomLogger],
})
export class CustomLoggerServicesModule { }
