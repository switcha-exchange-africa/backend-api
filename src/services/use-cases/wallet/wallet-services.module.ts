import { WalletFactoryService } from './wallet-factory.service';
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WalletServices } from "./wallet-services.services";
import { Module } from "@nestjs/common";
import { UtilsServicesModule } from '../utils/utils.module';
import { DiscordServicesModule } from 'src/frameworks/notification-services/discord/discord-service.module';

@Module({
  imports: [
    DataServicesModule,
    UtilsServicesModule,
    DiscordServicesModule
  ],
  providers: [WalletServices, WalletFactoryService],
  exports: [WalletServices, WalletFactoryService],
})
export class WalletServicesModule { }
