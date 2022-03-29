import { WebhookController } from './controllers/webhooks/index';
import { BuySellController } from './controllers/buy-sell/index';
import { AccountController } from "./controllers/account";
import { AuthenticationController } from "./controllers/authentication";
import { FaucetController } from "./controllers/faucet";
import { RatesController } from "./controllers/rates";
import { TransactionController } from "./controllers/transaction";
import { WalletController } from "./controllers/wallet";
import { HomeController } from './controllers/home';

export default [
  AuthenticationController,
  AccountController,
  WalletController,
  TransactionController,
  FaucetController,
  RatesController,
  BuySellController,
  WebhookController,
  HomeController
]