import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { CoinFactoryService } from "./coin-factory.service";
import { CoinServices } from "./coin.service";

@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [CoinServices, CoinFactoryService],
  exports: [CoinServices],
})
export class CoinServicesModule { }
