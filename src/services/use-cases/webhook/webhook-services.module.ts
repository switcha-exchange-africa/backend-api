import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WebhookServices } from "./webhook-services.services";
import { Module } from "@nestjs/common";
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { UtilsServicesModule } from "../utils/utils.module";

@Module({
  imports: [DataServicesModule, DiscordServicesModule, UtilsServicesModule],
  providers: [WebhookServices, TransactionFactoryService, NotificationFactoryService],
  exports: [WebhookServices],
})
export class WebhookServicesModule { }
