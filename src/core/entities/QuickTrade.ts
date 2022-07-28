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
  unitPrice: number
  amount: number;
  status: QuickTradeStatus;
  partialFilledDate: Date
  filledDate: Date;
  createdAt: Date;
  updatedAt: Date;
}


export class QuickTradeContract {
  quickTradeId: string;
  price: number;
  status: QuickTradeContractStatus;
  generalTransactionReference: string;
  createdAt: Date;
  updatedAt: Date;
}
export enum QuickTradeContractStatus {
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export const QUICK_TRADE_CONTRACT_LIST = [
  QuickTradeContractStatus.PENDING,
  QuickTradeContractStatus.COMPLETED,

]

export enum QuickTradeStatus {
  FILLED = 'filled',
  PARTIAL = 'partial'
}

export const QUICK_TRADE_STATUS_LIST = [
  QuickTradeStatus.FILLED,
  QuickTradeStatus.PARTIAL,
  
]