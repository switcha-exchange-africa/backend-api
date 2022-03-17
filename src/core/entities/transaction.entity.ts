import { UserDetail } from "src/core/entities/user.entity";
import {
  COIN_TYPES,
  TRANSACTION_TYPE,
  TRANSACTION_SUBTYPE,
  TRANSACTION_STATUS,
  SWITCHATYPESTRANSACTION,
} from "src/lib/constants";

export interface Rates{
  buyRate: number,
  sellRate: number
}

export class Transaction {
  userId: string;
  walletId: string;
  txRefId: string;
  currency: COIN_TYPES;
  amount: number;
  signedAmount: number;
  type: TRANSACTION_TYPE;
  subType: TRANSACTION_SUBTYPE;
  user: UserDetail;
  status: TRANSACTION_STATUS;
  balanceAfter: number;
  balanceBefore: number;
  rate: Rates;
  switchaTypeTransaction: SWITCHATYPESTRANSACTION;
}
