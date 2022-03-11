import {
  BLOCKCHAIN_NETWORK,
  COIN_TYPES,
  WALLET_STATUS,
} from "src/lib/constants";

import { UserDetail } from "src/core/entities/user.entity";
export class Wallet {
  balance: number;

  address: string;

  userId: string;

  user: UserDetail;

  network: BLOCKCHAIN_NETWORK;

  coinType: COIN_TYPES;

  status: WALLET_STATUS;

  lastDeposit: number;

  lastWithdrawal: number;

  createdAt: Date;

  updatedAt: Date;

  isBlocked: boolean;
}
