import { AccountController } from "./account";
import { AuthenticationController } from "./authentication";
import { BankController } from "./bank";
import { BuySellController } from "./buy-sell";
import { FaucetController } from "./faucet";
import { HomeController } from "./home";
import { NotificationController } from "./notification";
import { RatesController } from "./rates";
import { TransactionController } from "./transaction";
import { WalletController } from "./wallet";
import { WebhookController } from "./webhooks";

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
  NotificationController
]