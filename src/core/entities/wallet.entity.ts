import {
  BLOCKCHAIN_NETWORK,
  WALLET_STATUS,
} from "src/lib/constants";

import { UserDetail } from "src/core/entities/user.entity";
export class Wallet {
  balance: number;

  address: string;

  secret: string;

  phrase: string;

  xpub:string;

  accountId: string;

  userId: string;

  user: UserDetail;

  network: BLOCKCHAIN_NETWORK;

  coin: string;

  status: WALLET_STATUS;

  lastDeposit: number;

  lastWithdrawal: number;

  createdAt: Date;

  updatedAt: Date;

  isBlocked: boolean;
}
