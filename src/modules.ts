import { EventEmitterServiceModule } from "./frameworks/event-emitter/event-emitter-service.module";
import { AxiosServiceModule } from "./frameworks/http/axios/axios-service.module";
import { RedisServiceModule } from "./frameworks/in-memory-database/redis/redis-service.module";
import { DiscordServicesModule } from "./frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "./services/data-services/data-services.module";
import { FaucetServicesModule } from "./services/use-cases/faucet/faucet-services.module";
import { TransactionServicesModule } from "./services/use-cases/transaction/transaction-services.module";
import { UserServicesModule } from "./services/use-cases/user/user-service.module";
import { WalletServicesModule } from "./services/use-cases/wallet/wallet-services.module";

export default [
  AxiosServiceModule,
  DataServicesModule,
  UserServicesModule,
  DiscordServicesModule,
  RedisServiceModule,
  WalletServicesModule,
  EventEmitterServiceModule,
  TransactionServicesModule,
  FaucetServicesModule
]