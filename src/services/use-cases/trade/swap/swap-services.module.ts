import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { SwapServices } from "./swap-services.services";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { ActivityFactoryService } from "../../activity/activity-factory.service";
import { UtilsServicesModule } from "../../utils/utils.module";

@Module({
  imports: [DataServicesModule, DiscordServicesModule, UtilsServicesModule],
  providers: [SwapServices, TransactionFactoryService, ActivityFactoryService],
  exports: [SwapServices, TransactionFactoryService],
})
export class SwapServicesModule { }
