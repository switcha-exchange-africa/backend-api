import { Status } from "../types/status";


export enum TRANSACTION_TYPE {
  DEBIT = "debit",
  CREDIT = "credit",
}

export const TRANSACTION_TYPE_LIST = [
  TRANSACTION_TYPE.DEBIT,
  TRANSACTION_TYPE.CREDIT,
];

export enum TRANSACTION_SUBTYPE {
  DEBIT = "debit",
  CREDIT = "credit",
  FEE = "fee",
  REVERSAL = "reversal",
}

export const TRANSACTION_SUBTYPE_LIST = [
  TRANSACTION_SUBTYPE.DEBIT,
  TRANSACTION_SUBTYPE.CREDIT,
  TRANSACTION_SUBTYPE.FEE,
  TRANSACTION_SUBTYPE.REVERSAL,
];

export enum TRANSACTION_STATUS {
  PENDING = "pending",
  COMPLETED = "completed",
  REJECTED = "rejected",
  FAILED = 'failed'
}

export const TRANSACTION_STATUS_LIST = [
  TRANSACTION_STATUS.PENDING,
  TRANSACTION_STATUS.COMPLETED,
  TRANSACTION_STATUS.REJECTED,
];

export enum CUSTOM_TRANSACTION_TYPE {
  DEPOSIT = "deposit",
  BUY = "buy",
  SELL = "sell",
  WITHDRAWAL = "withdrawal",
  P2P = "p2p",
  SWAP = "swap",
  FAUCET = "faucet",
  TRANSFER = "transfer",
  QUICK_TRADE = 'quick-trade'
}

export const CUSTOM_TRANSACTION_TYPES = [
  CUSTOM_TRANSACTION_TYPE.DEPOSIT,
  CUSTOM_TRANSACTION_TYPE.BUY,
  CUSTOM_TRANSACTION_TYPE.SELL,
  CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
  CUSTOM_TRANSACTION_TYPE.P2P,
  CUSTOM_TRANSACTION_TYPE.SWAP,
  CUSTOM_TRANSACTION_TYPE.FAUCET,
  CUSTOM_TRANSACTION_TYPE.TRANSFER,
  CUSTOM_TRANSACTION_TYPE.QUICK_TRADE
];
export interface Rates {
  pair: string,
  rate: number
}

export class Transaction {
  userId: string;
  walletId: string;
  currency: string;
  amount: number;
  signedAmount: number;
  type: TRANSACTION_TYPE;
  subType: TRANSACTION_SUBTYPE;
  status: Status;
  balanceAfter: number;
  balanceBefore: number;
  rate?: Rates;
  customTransactionType: CUSTOM_TRANSACTION_TYPE;
  createdAt: Date;
  updatedAt: Date;
  description: string
  hash: string
  tatumTransactionId: string;
  senderAddress: string
  reference: string
  generalTransactionReference: string
  p2pAdId: string;
  p2pOrderId: string;
  feeWalletId: string
  metadata: object;
  accountId: string
  tatumWithdrawalId;
  destination: string
}

