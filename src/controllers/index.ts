import { AccountController } from "./account";
import admin from "./admin";
import { AuthenticationController } from "./authentication";
import { BankController } from "./bank";
import { BuySellController } from "./buy-sell";
import { CoinController } from "./coins";
import { ExchangeRatesController } from "./exchange-rate";
import { FaucetController } from "./faucet";
import { HomeController } from "./home";
import { NotificationController } from "./notification";
import { P2pController } from "./p2p";
import { QuickTradeController } from "./quick-trade";
import { RatesController } from "./rates";
import { TransactionController } from "./transaction";
import { WalletController } from "./wallet";
import { WebhookController } from "./webhooks";
import { WithdrawalController } from "./withdrawal";

export default [
  AuthenticationController,
  AccountController,
  WalletController,
  TransactionController,
  FaucetController,
  RatesController,
  BuySellController,
  WebhookController,
  HomeController,
  BankController,
  NotificationController,
  QuickTradeController,
  ExchangeRatesController,
  WithdrawalController,
  CoinController,
  P2pController,
  ...admin
]