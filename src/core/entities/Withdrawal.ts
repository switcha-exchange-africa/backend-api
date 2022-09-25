import { CoinType } from "../types/coin"

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  DENIED = 'denied'
}
export enum WithdrawalType {
  CRYPTO = 'crypto',
  FIAT = 'fiat'
}
export enum WithdrawalSubType {
  P2P = 'p2p',
  BUY_SELL = 'buy-sell'
}

export enum WithdrawalPaymentMethod {
  BANK = 'bank',
  SATURN = 'saturn'
}

export const WITHDRAWAL_TYPE_LIST = [
  WithdrawalType.CRYPTO,
  WithdrawalType.FIAT
]

export const WITHDRAWAL_STATUS_LIST = [
  WithdrawalStatus.PENDING,
  WithdrawalStatus.PROCESSING,
  WithdrawalStatus.APPROVED,
  WithdrawalStatus.DENIED,
]
export const WITHDRAWAL_SUB_TYPE_LIST = [
  WithdrawalSubType.BUY_SELL,
  WithdrawalSubType.P2P
]
export const WITHDRAWAL_PAYMENT_METHOD_LIST = [
  WithdrawalPaymentMethod.BANK,
  WithdrawalPaymentMethod.SATURN
]
export type WithdrawalCryptoDestination = {
  address: string
  coin: string
  tagNumber: string
  memo: string
}

export class Withdrawal {
  userId: string;
  transactionId: string;
  walletId: string;
  bankId: string
  processedBy: WithdrawalCryptoDestination
  processedReason: string
  currency: CoinType
  reference: string
  type: WithdrawalType
  subType: WithdrawalSubType
  paymentMethod: WithdrawalPaymentMethod
  status: WithdrawalStatus
  amount: number
  originalAmount: number
  fee: number
  createdAt?: Date;
  updatedAt?: Date;
}
