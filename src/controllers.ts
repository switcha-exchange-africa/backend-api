import { AccountController } from "./controllers/account";
import { AuthenticationController } from "./controllers/authentication";
import { FaucetController } from "./controllers/faucet";
import { TransactionController } from "./controllers/transaction";
import { WalletController } from "./controllers/wallet";

export default [
  AuthenticationController,
  AccountController,
  WalletController,
  TransactionController,
  FaucetController
]