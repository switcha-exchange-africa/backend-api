import { Module } from "@nestjs/common";
import { CustomLoggerFactoryServices } from './custom-logger-factory.services';

@Module({
  imports: [],
  providers: [CustomLoggerFactoryServices],
  exports: [CustomLoggerFactoryServices],
})
export class CustomLoggerServicesModule { }
