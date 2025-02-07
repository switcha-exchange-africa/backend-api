
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { ActivityFactoryService } from "../../activity/activity-factory.service";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { UtilsServicesModule } from "../../utils/utils.module";
import { BuySellServices } from "./buy-sell-services.services";


@Module({
    imports: [DataServicesModule, DiscordServicesModule, UtilsServicesModule],
    providers: [BuySellServices, TransactionFactoryService, NotificationFactoryService, ActivityFactoryService],
    exports: [BuySellServices, TransactionFactoryService]
})

export class BuySellServicesModule { }