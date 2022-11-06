import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { TradeDisputeFactoryService } from "./trade-dispute-factory.service";
import { TradeDisputeServices } from "./trade-disputes.service";


@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [TradeDisputeFactoryService, TradeDisputeServices],
  exports: [TradeDisputeFactoryService, TradeDisputeServices],
})
export class TradeDisputeServicesModule { }

