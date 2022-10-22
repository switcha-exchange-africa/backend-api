
import { Module } from "@nestjs/common";
import { AxiosServiceModule } from "src/frameworks/http/axios/axios-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { SeedServices } from "./seed.service";


@Module({
  imports: [DataServicesModule, AxiosServiceModule, UtilsServicesModule],
  providers: [SeedServices],
  exports: [SeedServices]
})

export class SeedServicesModule { }