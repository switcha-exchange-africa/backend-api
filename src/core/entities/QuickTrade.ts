export enum QuickTradeType {
  BUY = 'buy',
  SELL = 'sell'
}
export const QUICK_TRADE_TYPE_LIST = [
  QuickTradeType.BUY,
  QuickTradeType.SELL,

]


export class QuickTrade {
  buyerId: string;
  sellerId: string;
  type: QuickTradeType;
  pair: string
  price: number
  amount: string;
  partialFilledDate: Date
  filledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
