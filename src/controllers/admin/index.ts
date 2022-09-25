import { AdminAuthenticationController } from "./authentication";
import { AdminExchangeRatesController } from "./exchange-rates";
import { AdminFeeController } from "./fee";
import { AdminTransactionsController } from "./transactions";
import { AdminUsersController } from "./users";
import { AdminWalletsController } from "./wallets";

export default [
  AdminAuthenticationController,
  AdminTransactionsController,
  AdminUsersController,
  AdminWalletsController,
  AdminExchangeRatesController,
  AdminFeeController
]