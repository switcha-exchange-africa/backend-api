import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WebhookServices } from "./webhook-services.services";
import { Module } from "@nestjs/common";
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";

@Module({
  imports: [DataServicesModule],
  providers: [WebhookServices, TransactionFactoryService, NotificationFactoryService],
  exports: [WebhookServices],
})
export class WebhookServicesModule { }
