import { Status } from "../types/status"

export enum P2pAdsType {
  BUY = 'buy',
  SELL = 'sell'
}
export enum P2pPriceType {
  FIXED = 'fixed',
  FLOAT = 'float'
}
export type CounterpartConditionsType = {
  kyc: boolean, registeredZeroDaysAgo: boolean, moreThanDot1Btc: boolean
}
export const P2pAdsList = [
  P2pAdsType.BUY,
  P2pAdsType.SELL,
]

export const P2pPriceTypeList = [
  P2pPriceType.FIXED,
  P2pPriceType.FLOAT,
]

export class P2pAds {
  coin: string
  cash: string
  remark: string
  paymentTimeLimit: string
  reply: string
  userId: string;
  type: P2pAdsType;
  priceType: P2pPriceType;
  price: number
  totalAmount: number
  minLimit: number
  maxLimit: number
  highestPriceOrder: number
  counterPartConditions: CounterpartConditionsType
  banks: string[];
  isPublished: boolean
  isSwitchaMerchant: boolean
  status: Status
}


