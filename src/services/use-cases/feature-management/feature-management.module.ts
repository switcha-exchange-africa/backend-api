import { DataServicesModule } from "src/services/data-services/data-services.module";
import { Module } from "@nestjs/common";
import { UtilsServicesModule } from "../utils/utils.module";
import { FeatureManagementServices } from "./feature-management.service";

@Module({
  imports: [
    DataServicesModule,
    UtilsServicesModule
  ],
  providers: [FeatureManagementServices],
  exports: [FeatureManagementServices],
})
export class FeatureServicesModule { }
