
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { NotificationFactoryService } from "./notification-factory.service";
import { NotificationServices } from "./notification.service";


@Module({
    imports: [DataServicesModule, UtilsServicesModule],
    providers: [NotificationServices, NotificationFactoryService],
    exports: [NotificationServices, NotificationFactoryService]
})

export class NotificationServicesModule { }