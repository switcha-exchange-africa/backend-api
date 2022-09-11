import { AdminAuthenticationController } from "./authentication";
import { AdminExchangeRatesController } from "./exchange-rates";
import { AdminTransactionsController } from "./transactions";
import { AdminUsersController } from "./users";
import { AdminWalletsController } from "./wallets";

export default [
  AdminAuthenticationController,
  AdminTransactionsController,
  AdminUsersController,
  AdminWalletsController,
  AdminExchangeRatesController
]