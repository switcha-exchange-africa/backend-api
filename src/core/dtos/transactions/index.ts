import { PaginationType } from "src/core/types/database";

export type IGetTransactions = PaginationType & {

  userId: string
  walletId: string
  currency: string
  tatumTransactionId: string
  reference: string
  generalTransactionReference: string
  senderAddress: string
  type: string
  subType: string
  status: string
  customTransactionType: string
  hash: string
  accountId: string
}