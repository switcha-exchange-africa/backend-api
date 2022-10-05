import { PaginationType } from "../types/database";

export class Coin {
  coin: string
  canSwap: boolean;
  canBuy: boolean;
  canSell: boolean;
  type: CoinType
  canP2p: boolean;
  canWithdraw: boolean
  userId: string;
  externalDeposit: boolean
  bankTransferDeposit: boolean
}

export type IGetCoins = PaginationType & {
  coin: string
  userId?: string
}

export enum CoinType {
  CRYPTO = 'crypto',
  FIAT = 'fiat'
} 
export const CoinTypeList = [
  CoinType.CRYPTO,
  CoinType.FIAT,

]