import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { SwapServices } from "./swap-services.services";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { UtilsServices } from "../../utils/utils.service";

@Module({
  imports: [DataServicesModule, DiscordServicesModule],
  providers: [SwapServices, TransactionFactoryService, UtilsServices],
  exports: [SwapServices, TransactionFactoryService],
})
export class SwapServicesModule { }
