import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { BlockchainFeesAccruedFactoryServices, FeeFactoryServices } from "./fee-factory.service";
import { FeeServices } from "./fee.service";


@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [FeeServices, FeeFactoryServices, BlockchainFeesAccruedFactoryServices],
  exports: [FeeServices, FeeFactoryServices, BlockchainFeesAccruedFactoryServices],
})
export class FeeServicesModule { }
