import { AdminAuthenticationController } from "./authentication";
import { AdminChatMessageController } from "./chat-messages";
import { AdminCoinController } from "./coins";
import { AdminExchangeRatesController } from "./exchange-rates";
import { AdminFeatureManagementController } from "./feature-management";
import { AdminFeeController } from "./fee";
import { AdminFeeWalletsController } from "./fee-wallet";
import { AdminKycController } from "./kyc";
import { AdminSeedController } from "./seed";
import { AdminTradesController } from "./trades";
import { AdminTransactionsController } from "./transactions";
import { AdminUsersController } from "./users";
import { AdminWalletsController } from "./wallets";
import { AdminWithdrawalController } from "./withdrawals";

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
  AdminKycController,
  AdminWithdrawalController,
  AdminTradesController,
  AdminChatMessageController
]