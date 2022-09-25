
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { UtilsServices } from "../../utils/utils.service";
import { BuySellServices } from "./buy-sell-services.services";


@Module({
    imports: [DataServicesModule, DiscordServicesModule],
    providers: [BuySellServices, TransactionFactoryService, NotificationFactoryService, UtilsServices],
    exports: [BuySellServices, TransactionFactoryService]
})

export class BuySellServicesModule { }