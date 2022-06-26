
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { NotificationFactoryService } from "./notification-factory.service";
import { NotificationServices } from "./notification.service";


@Module({
    imports: [DataServicesModule],
    providers: [NotificationServices, NotificationFactoryService],
    exports: [NotificationServices, NotificationFactoryService]
})

export class NotificationServicesModule{}