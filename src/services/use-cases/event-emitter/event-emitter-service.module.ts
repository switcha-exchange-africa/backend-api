import { WalletFactoryService } from "../wallet/wallet-factory.service";
import { WalletServicesModule } from "src/services/use-cases/wallet/wallet-services.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WalletCreateListener } from "./listener/wallet.listener";
import { Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { EmailSentListener } from "./listener/email.listener";
import { SmsSentListener } from "./listener/sms.listener";
import { BullModule } from '@nestjs/bull';
import { UtilsServicesModule } from "src/services/use-cases/utils/utils.module";
import { env } from "src/configuration";
import { GondorListener } from "./listener/gondor.listener";
import { MongooseModule } from "@nestjs/mongoose";
import { Gondor, GondorSchema } from "src/frameworks/data-services/mongo/model/Gondor";
import { WithdrawalToFeeWalletListener } from "./listener/withdrawal-to-fee-wallet.listeners";
import { AxiosServiceModule } from "src/frameworks/http/axios/axios-service.module";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { WithdrawalLib } from "../withdrawal/withdrawal.lib";
// import { CustomLoggerListener } from "./listener/custom-logger.listener";
// import { CustomLoggerFactoryServices } from "src/services/use-cases/customer-logger/custom-logger-factory.services";

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: ".",
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
    DataServicesModule,
    WalletServicesModule,
    DiscordServicesModule,
    AxiosServiceModule,
    BullModule.registerQueue(
      { name: `${env.env}.wallet` },
      { name: `${env.env}.wallet.webhook.subscription` }
    ),
    UtilsServicesModule,
    MongooseModule.forFeature([
      { name: Gondor.name, schema: GondorSchema }
    ], 'gondor')

  ],
  providers: [
    EmailSentListener,
    SmsSentListener,
    WalletCreateListener,
    WalletFactoryService,
    GondorListener,
    WithdrawalToFeeWalletListener,
    WithdrawalLib
    // CustomLoggerListener,
    // CustomLoggerFactoryServices,
  ],
})
export class EventEmitterServiceModule { }
