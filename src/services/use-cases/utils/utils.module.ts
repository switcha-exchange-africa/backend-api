
import { Module } from "@nestjs/common";
import { AxiosServiceModule } from "src/frameworks/http/axios/axios-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { ActivityFactoryService } from "../activity/activity-factory.service";
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { UtilsServices } from "./utils.service";


@Module({
  imports: [DataServicesModule, AxiosServiceModule],
  providers: [UtilsServices, NotificationFactoryService, ActivityFactoryService],
  exports: [UtilsServices]
})

export class UtilsServicesModule { }