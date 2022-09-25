import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServices } from "../utils/utils.service";
import { ExchangeRateFactoryServices } from './exchange-rate-factory.service';
import { ExchangeRateServices } from "./exchange-rates.service";

@Module({
  imports: [DataServicesModule],
  providers: [ExchangeRateServices, ExchangeRateFactoryServices, UtilsServices],
  exports: [ExchangeRateServices, ExchangeRateFactoryServices],
})
export class ExchangeRateServicesModule { }
