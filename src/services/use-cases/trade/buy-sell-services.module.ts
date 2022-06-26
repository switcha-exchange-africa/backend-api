
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { BuySellServices } from "./buy-sell-services.services";


@Module({
    imports: [DataServicesModule, DiscordServicesModule],
    providers: [BuySellServices, TransactionFactoryService],
    exports: [BuySellServices, TransactionFactoryService]
})

export class BuySellServicesModule { }