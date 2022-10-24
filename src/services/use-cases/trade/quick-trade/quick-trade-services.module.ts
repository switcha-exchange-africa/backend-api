
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { env } from "src/configuration";
import { RedisServiceModule } from "src/frameworks/in-memory-database/redis/redis-service.module";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { UtilsServicesModule } from "../../utils/utils.module";
import { P2pOrderFactoryService } from "../p2p/p2p-factory.service";
import { QuickTradeContractFactoryService, QuickTradeFactoryService } from "./quick-trade-factory.service";
import { QuickTradeServices } from "./quick-trade-services.services";


@Module({
    imports: [
        DataServicesModule,
        DiscordServicesModule,
        UtilsServicesModule,
        UtilsServicesModule,
        RedisServiceModule,
        BullModule.registerQueue(
          { name: `${env.env}.order.expiry` },
        ),
    ],
    providers: [
        QuickTradeServices,
        TransactionFactoryService,
        NotificationFactoryService,
        QuickTradeFactoryService,
        QuickTradeContractFactoryService,
        P2pOrderFactoryService,
    ],
    exports: [QuickTradeServices, TransactionFactoryService]
})

export class QuickTradeServicesModule { }




