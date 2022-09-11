import { WalletServices } from 'src/services/use-cases/wallet/wallet-services.services';
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { AccountServices } from "./account/account.services";
import { AuthServices } from "./auth-services.services";
import { UserFactoryService } from "./user-factory.service";
import { WalletFactoryService } from '../wallet/wallet-factory.service';
import { UserServices } from './user-services.services';

@Module({
  imports: [DataServicesModule, DiscordServicesModule],
  providers: [UserFactoryService, AuthServices, AccountServices, WalletServices, WalletFactoryService, UserServices],
  exports: [UserFactoryService, AuthServices, AccountServices, WalletServices, UserServices],
})
export class UserServicesModule { }
