import { AdminAuthenticationController } from "./authentication";
import { AdminCoinController } from "./coins";
import { AdminExchangeRatesController } from "./exchange-rates";
import { AdminFeatureManagementController } from "./feature-management";
import { AdminFeeController } from "./fee";
import { AdminFeeWalletsController } from "./fee-wallet";
import { AdminKycController } from "./kyc";
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
  AdminSeedController,
  AdminFeatureManagementController,
  AdminKycController
]