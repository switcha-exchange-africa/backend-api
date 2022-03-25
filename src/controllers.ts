import { WebhookEvents } from './controllers/webhooks/index';
import { TradeController } from './controllers/trade/index';
import { AccountController } from "./controllers/account";
import { AuthenticationController } from "./controllers/authentication";
import { FaucetController } from "./controllers/faucet";
import { RatesController } from "./controllers/rates";
import { TransactionController } from "./controllers/transaction";
import { WalletController } from "./controllers/wallet";

export default [
  AuthenticationController,
  AccountController,
  WalletController,
  TransactionController,
  FaucetController,
  RatesController,
  TradeController,
  WebhookEvents
]