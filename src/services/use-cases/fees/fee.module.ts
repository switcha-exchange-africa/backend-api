import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { FeeFactoryServices } from "./fee-factory.service";
import { FeeServices } from "./fee.service";


@Module({
  imports: [DataServicesModule],
  providers: [FeeServices, FeeFactoryServices],
  exports: [FeeServices, FeeFactoryServices],
})
export class FeeServicesModule { }
