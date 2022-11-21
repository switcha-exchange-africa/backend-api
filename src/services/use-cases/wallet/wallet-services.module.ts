import { WalletFactoryService } from './wallet-factory.service';
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WalletServices } from "./wallet-services.services";
import { Module } from "@nestjs/common";
import { UtilsServicesModule } from '../utils/utils.module';
import { DiscordServicesModule } from 'src/frameworks/notification-services/discord/discord-service.module';
import { NotificationFactoryService } from '../notification/notification-factory.service';
import { TransactionFactoryService } from '../transaction/transaction-factory.services';
import { AxiosServiceModule } from 'src/frameworks/http/axios/axios-service.module';

@Module({
  imports: [
    DataServicesModule,
    UtilsServicesModule,
    DiscordServicesModule,
    AxiosServiceModule
  ],
  providers: [
    WalletServices,
    TransactionFactoryService,
    NotificationFactoryService,
    WalletFactoryService,
  ],
  exports: [WalletServices, WalletFactoryService],
})
export class WalletServicesModule { }
