import { PaginationType } from "src/core/types/database";

export type IGetActivities = PaginationType & {
  userId: string
  action: string
}


export enum ActivityAction {
  SIGNUP = 'signup',
  SIGNIN = 'signin',
  VERIFY_EMAIL = 'verify-email',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
  SWAP = 'swap',
  BUY = 'buy',
  SELL = 'sell',
  P2P_SELL = 'p2p-sell',
  P2P_BUY = 'p2p-buy',
  QUICK_TRADE_SELL = 'quick-trade-sell',
  QUICK_TRADE_BUY = 'quick-trade-buy',
  P2P_SELL_AD = 'p2p-sell-ad',
  P2P_BUY_AD = 'p2p-buy-ad',

}

