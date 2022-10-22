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
  QUICK_TRADE_BUY = 'quick-trade-buy',
  QUICK_TRADE_SELL = 'quick-trade-sell',
  P2P_SELL_AD = 'p2p-sell-ad',
  P2P_BUY_AD = 'p2p-buy-ad',

}


export enum FeatureEnum {
  SIGNUP = 'signup',
  SIGNIN = 'signin',
  VERIFY_EMAIL = 'verify-email',
  RECOVER_PASSWORD = 'recover-email',
  RESET_PASSWORD = 'reset-password',
  P2P_AD = 'p2p-ad',
  P2P_ORDER = 'p2p-order',
  WITHDRAWAL = 'withdrawal',
  QUICK_TRADE = 'quick-trade',
  DEPOSIT = 'deposit',
  SWAP = 'swap',
}