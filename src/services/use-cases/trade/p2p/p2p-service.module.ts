
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { env } from "src/configuration";
import { RedisServiceModule } from "src/frameworks/in-memory-database/redis/redis-service.module";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { UtilsServicesModule } from "../../utils/utils.module";
import { P2pAdBankFactoryService, P2pFactoryService, P2pOrderFactoryService } from "./p2p-factory.service";
import { P2pServices } from "./p2p.service";


@Module({
  imports: [
    DataServicesModule,
    DiscordServicesModule,
    UtilsServicesModule,
    RedisServiceModule,
    BullModule.registerQueue(
      { name:`${env.env}.order.expiry` },
    ),
  ],
  providers: [
    P2pFactoryService,
    P2pAdBankFactoryService,
    P2pOrderFactoryService,
    TransactionFactoryService,
    NotificationFactoryService,
    P2pServices
  ],
  exports: [
    P2pServices,
    P2pFactoryService,
    P2pOrderFactoryService,

  ]
})

export class P2pServicesModule { }