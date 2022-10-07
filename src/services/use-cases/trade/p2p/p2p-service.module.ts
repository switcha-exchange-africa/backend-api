
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../../utils/utils.module";
import { P2pAdBankFactoryService, P2pFactoryService, P2pOrderFactoryService } from "./p2p-factory.service";
import { P2pServices } from "./p2p.service";


@Module({
  imports: [
    DataServicesModule,
    DiscordServicesModule,
    UtilsServicesModule,
    BullModule.registerQueue(
      { name: 'order.expiry' },
    ),
  ],
  providers: [
    P2pFactoryService,
    P2pAdBankFactoryService,
    P2pOrderFactoryService,
    P2pServices
  ],
  exports: [
    P2pServices,
    P2pFactoryService,
    P2pOrderFactoryService,

  ]
})

export class P2pServicesModule { }