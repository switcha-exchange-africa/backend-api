import { FaucetController } from './controllers/faucet/index';
import { EventEmitterServiceModule } from "./frameworks/event-emitter/event-emitter-service.module";
import { WalletServicesModule } from "./services/use-cases/wallet/wallet-services.module";
import { WalletController } from "./controllers/wallet";
import { AxiosServiceModule } from "./frameworks/http/axios/axios-service.module";
import { Module } from "@nestjs/common";
import { AccountController } from "./controllers/account";
import { AuthenticationController } from "./controllers/authentication";
import { RedisServiceModule } from "./frameworks/in-memory-database/redis/redis-service.module";
import { DiscordServicesModule } from "./frameworks/notification-services/discord/discord-service.module";
import { JWT_USER_PAYLOAD_TYPE } from "./lib/constants";
import { DataServicesModule } from "./services/data-services/data-services.module";
import { UserServicesModule } from "./services/use-cases/user/user-service.module";
import { TransactionServicesModule } from "./services/use-cases/transaction/transaction-services.module";
import { TransactionController } from "./controllers/transaction";
import { FaucetServicesModule } from './services/use-cases/wallet/faucet/faucet-services.module';

declare global {
  namespace Express {
    export interface Request {
      user?: JWT_USER_PAYLOAD_TYPE;
    }
  }

  var io: any;
}
@Module({
  imports: [
    AxiosServiceModule,
    DataServicesModule,
    UserServicesModule,
    DiscordServicesModule,
    RedisServiceModule,
    WalletServicesModule,
    EventEmitterServiceModule,
    TransactionServicesModule,
    FaucetServicesModule
  ],
  controllers: [
    AuthenticationController,
    AccountController,
    WalletController,
    TransactionController,
    FaucetController
  ],
  providers: [],
})
export class AppModule {}

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(LoggingMiddleware).forRoutes("/")
//   }
// }
