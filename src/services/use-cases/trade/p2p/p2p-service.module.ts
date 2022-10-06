
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../../utils/utils.module";
import { P2pAdBankFactoryService, P2pFactoryService } from "./p2p-factory.service";
import { P2pServices } from "./p2p.service";


@Module({
  imports: [DataServicesModule, DiscordServicesModule, UtilsServicesModule],
  providers: [
    P2pFactoryService,
    P2pAdBankFactoryService,
    P2pServices
  ],
  exports: [P2pServices, P2pFactoryService]
})

export class P2pServicesModule { }