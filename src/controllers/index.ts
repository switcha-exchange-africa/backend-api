import { AccountController } from "./account";
import admin from "./admin";
import { AuthenticationController } from "./authentication";
import { BankController } from "./bank";
import { BuySellController } from "./buy-sell";
import { ChatMessageController } from "./chat-messages";
import { CoinController } from "./coins";
import { ExchangeRatesController } from "./exchange-rate";
import { FaucetController } from "./faucet";
import { FeatureManagementController } from "./feature-managment";
import { FeeController } from "./fee";
import { HomeController } from "./home";
import { KycController } from "./kyc";
import { MiscController } from "./misc";
import { NotificationController } from "./notification";
import { P2pController } from "./p2p";
import { QuickTradeController } from "./quick-trade";
import { RatesController } from "./rates";
import { TradeDisputeController } from "./trade-disputes";
import { TransactionController } from "./transaction";
import { WaitListController } from "./waitlist";
import { WalletController } from "./wallet";
import { WebPushController } from "./web-push";
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
  MiscController,
  FeeController,
  WaitListController,
  WebPushController,
  KycController,
  ChatMessageController,
  TradeDisputeController,
  FeatureManagementController,
  ...admin
]