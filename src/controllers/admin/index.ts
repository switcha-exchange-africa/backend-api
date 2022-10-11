import { AdminAuthenticationController } from "./authentication";
import { AdminCoinController } from "./coins";
import { AdminExchangeRatesController } from "./exchange-rates";
import { AdminFeeController } from "./fee";
import { AdminFeeWalletsController } from "./fee-wallet";
import { AdminSeedController } from "./seed";
import { AdminTransactionsController } from "./transactions";
import { AdminUsersController } from "./users";
import { AdminWalletsController } from "./wallets";

export default [
  AdminAuthenticationController,
  AdminTransactionsController,
  AdminUsersController,
  AdminWalletsController,
  AdminExchangeRatesController,
  AdminFeeController,
  AdminCoinController,
  AdminFeeWalletsController,
  AdminSeedController
]