import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { DashboardServices } from "./dashboard.service";

@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [DashboardServices],
  exports: [DashboardServices],
})
export class DashboardServicesModule { }
