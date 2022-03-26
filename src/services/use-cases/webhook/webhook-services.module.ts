import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WebhookServices } from "./webhook-services.services";
import { Module } from "@nestjs/common";

@Module({
  imports: [DataServicesModule],
  providers: [WebhookServices],
  exports: [WebhookServices],
})
export class WebhookServicesModule { }
