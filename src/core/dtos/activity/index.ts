import { PaginationType } from "src/core/types/database";

export type IGetActivities = PaginationType & {
  userId: string
  action: string
}


export enum ActivityAction {
  SIGNUP = 'signup',
  SIGNIN = 'signin',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  SWAP = 'swap',
  BUY = 'buy',
  SELL = 'sell',
  P2P_SELL = 'p2p-sell',
  P2P_BUY = 'p2p-buy',
}

