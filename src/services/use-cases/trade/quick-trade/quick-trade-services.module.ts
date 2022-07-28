
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { QuickTradeContractFactoryService, QuickTradeFactoryService } from "./quick-trade-factory.service";
import { QuickTradeServices } from "./quick-trade-services.services";


@Module({
    imports: [DataServicesModule, DiscordServicesModule],
    providers: [QuickTradeServices, TransactionFactoryService, NotificationFactoryService, QuickTradeFactoryService, QuickTradeContractFactoryService],
    exports: [QuickTradeServices, TransactionFactoryService]
})

export class QuickTradeServicesModule { }




