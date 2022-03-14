import { WalletServicesModule } from 'src/services/use-cases/wallet/wallet-services.module';
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WalletCreateListener } from "./listener/wallet.listener";
import { Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { EmailSentListener } from "./listener/email.listener";
import { SmsSentListener } from "./listener/sms.listener";

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
  ],
  providers: [EmailSentListener, SmsSentListener, WalletCreateListener],
})
export class EventEmitterServiceModule {}
