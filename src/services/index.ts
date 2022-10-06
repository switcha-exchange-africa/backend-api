import { BullServiceModule } from "src/frameworks/bull/bull-services.module";
import { EventEmitterServiceModule } from "src/frameworks/event-emitter/event-emitter-service.module";
import { AxiosServiceModule } from "src/frameworks/http/axios/axios-service.module";
import { RedisServiceModule } from "src/frameworks/in-memory-database/redis/redis-service.module";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "./data-services/data-services.module";
import { AdminServicesModule } from "./use-cases/admin/admin.module";
import { BankServicesModule } from "./use-cases/bank/bank-services.module";
import { CoinServicesModule } from "./use-cases/coins/coin.module";
import { ExchangeRateServicesModule } from "./use-cases/exchange-rates/exchange-rate-service.module";
import { FaucetServicesModule } from "./use-cases/faucet/faucet-services.module";
import { FeeWalletServicesModule } from "./use-cases/fee-wallet/fee-wallet.module";
import { FeeServicesModule } from "./use-cases/fees/fee.module";
import { KycServicesModule } from "./use-cases/kyc/kyc-services.module";
import { NotificationServicesModule } from "./use-cases/notification/notification.module";
import { RatesServicesModule } from "./use-cases/rates/rates-services.module";
import { BuySellServicesModule } from "./use-cases/trade/buy-sell/buy-sell-services.module";
import { P2pServicesModule } from "./use-cases/trade/p2p/p2p-service.module";
import { QuickTradeServicesModule } from "./use-cases/trade/quick-trade/quick-trade-services.module";
import { SwapServicesModule } from "./use-cases/trade/swap/swap-services.module";
import { TransferServicesModule } from "./use-cases/trade/transfer/transfer-services.module";
import { TransactionServicesModule } from "./use-cases/transaction/transaction-services.module";
import { UserServicesModule } from "./use-cases/user/user-service.module";
import { WalletServicesModule } from "./use-cases/wallet/wallet-services.module";
import { WebhookServicesModule } from "./use-cases/webhook/webhook-services.module";
import { WithdrawalServicesModule } from "./use-cases/withdrawal/withdrawal.module";

export default [
  AxiosServiceModule,
  DataServicesModule,
  UserServicesModule,
  DiscordServicesModule,
  RedisServiceModule,
  WalletServicesModule,
  EventEmitterServiceModule,
  TransactionServicesModule,
  FaucetServicesModule,
  RatesServicesModule,
  BuySellServicesModule,
  SwapServicesModule,
  WebhookServicesModule,
  BullServiceModule,
  TransferServicesModule,
  BankServicesModule,
  QuickTradeServicesModule,
  NotificationServicesModule,
  AdminServicesModule,
  KycServicesModule,
  ExchangeRateServicesModule,
  FeeServicesModule,
  FeeWalletServicesModule,
  WithdrawalServicesModule,
  CoinServicesModule,
  P2pServicesModule
]