import { DataServicesModule } from "src/services/data-services/data-services.module";
import { Module } from "@nestjs/common";
import { WithdrawalFactoryService } from './withdrawal-factory.service';
import { WithdrawalServices } from './withdrawal.service';
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { ActivityFactoryService } from "../activity/activity-factory.service";
import { AxiosServiceModule } from "src/frameworks/http/axios/axios-service.module";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { WithdrawalLib } from "./withdrawal.lib";
import { BlockchainFeesAccruedFactoryServices } from "../fees/fee-factory.service";

@Module({
  imports: [
    DataServicesModule,
    DiscordServicesModule,
    AxiosServiceModule,
    UtilsServicesModule
  ],
  providers: [
    WithdrawalServices,
    WithdrawalFactoryService,
    TransactionFactoryService,
    NotificationFactoryService,
    ActivityFactoryService,
    WithdrawalLib,
    BlockchainFeesAccruedFactoryServices
  ],
  exports: [WithdrawalServices, WithdrawalFactoryService],
})
export class WithdrawalServicesModule { }
