import { Module } from "@nestjs/common";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { AccountServices } from "./account/account.services";
import { AuthServices } from "./auth-services.services";
import { UserFactoryService } from "./user-factory.service";



@Module({
  imports: [
    DataServicesModule,
    DiscordServicesModule,
  ],
  providers: [UserFactoryService, AuthServices, AccountServices],
  exports: [UserFactoryService, AuthServices, AccountServices],
})

export class UserServicesModule { }
