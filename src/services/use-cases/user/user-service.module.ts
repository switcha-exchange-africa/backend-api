import { WalletServices } from 'src/services/use-cases/wallet/wallet-services.services';
import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { AccountServices } from "./account/account.services";
import { AuthServices } from "./auth-services.services";
import { MutateUserFactoryService, UserFactoryService, UserFeatureManagementFactoryService } from "./user-factory.service";
import { WalletFactoryService } from '../wallet/wallet-factory.service';
import { UserServices } from './user-services.services';
import { ActivityFactoryService } from '../activity/activity-factory.service';
import { UtilsServicesModule } from '../utils/utils.module';
import { TwoFaFactoryService } from "./user-factory.service";
import { TransactionFactoryService } from '../transaction/transaction-factory.services';
import { NotificationFactoryService } from '../notification/notification-factory.service';

@Module({
  imports: [DataServicesModule, DiscordServicesModule, UtilsServicesModule],
  providers: [
    UserFactoryService,
    AuthServices,
    AccountServices,
    WalletServices,
    WalletFactoryService,
    UserServices,
    UserFeatureManagementFactoryService,
    ActivityFactoryService,
    MutateUserFactoryService,
    TwoFaFactoryService,
    TransactionFactoryService,
    NotificationFactoryService
  ],
  exports: [
    UserFactoryService,
    AuthServices,
    AccountServices,
    WalletServices,
    UserServices,
    UserFeatureManagementFactoryService
  ],
})
export class UserServicesModule { }
