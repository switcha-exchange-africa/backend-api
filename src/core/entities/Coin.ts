import { PaginationType } from "../types/database";

export class Coin {
  coin: string
  canSwap: boolean;
  canBuy: boolean;
  canSell: boolean;
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