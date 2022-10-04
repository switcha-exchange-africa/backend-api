import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServices } from "../../utils/utils.service";
import { CoinServices } from "./coin.service";

@Module({
  imports: [DataServicesModule],
  providers: [CoinServices, UtilsServices],
  exports: [CoinServices],
})
export class CoinServicesModule { }
