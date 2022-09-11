import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { ExchangeRateFactoryServices } from './exchange-rate-factory.service';
import { ExchangeRateServices } from "./exchange-rates.service";

@Module({
  imports: [DataServicesModule],
  providers: [ExchangeRateServices, ExchangeRateFactoryServices],
  exports: [ExchangeRateServices, ExchangeRateFactoryServices],
})
export class ExchangeRateServicesModule { }
