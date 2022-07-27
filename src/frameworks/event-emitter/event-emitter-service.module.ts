import { WalletFactoryService } from "./../../services/use-cases/wallet/wallet-factory.service";
import { WalletServicesModule } from "src/services/use-cases/wallet/wallet-services.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WalletCreateListener } from "./listener/wallet.listener";
import { Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { EmailSentListener } from "./listener/email.listener";
import { SmsSentListener } from "./listener/sms.listener";
import { BullModule } from '@nestjs/bull';
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
    BullModule.registerQueue(
      { name: 'wallet' },
      { name: 'wallet.webhook.subscription' }
    )

  ],
  providers: [
    EmailSentListener,
    SmsSentListener,
    WalletCreateListener,
    WalletFactoryService,
    // CustomLoggerListener,
    // CustomLoggerFactoryServices,
  ],
})
export class EventEmitterServiceModule { }
