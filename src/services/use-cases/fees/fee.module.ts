import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { FeeFactoryServices } from "./fee-factory.service";
import { FeeServices } from "./fee.service";


@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [FeeServices, FeeFactoryServices],
  exports: [FeeServices, FeeFactoryServices],
})
export class FeeServicesModule { }
