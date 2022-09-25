import { IConvertByPair } from "../dtos/rates/rates.dto"

export enum CoinType {
  BTC = "BTC",
  ETH = "ETH",
  USDT = "USDT",
  USDC = "USDC",
  USDT_TRON = "USDT_TRON",
  NGN = "NGN",
  USD = "USD",
}


export const StableCoins = [
  CoinType.USDT,
  CoinType.USDC,
]

export const SwapableCoins = [
  CoinType.USDT,
  CoinType.USDC,
  CoinType.BTC,
  CoinType.ETH,

]
export enum FiatCoinType {
  USD = 'USD',
  NGN = 'NGN'
}

export type ISwap = IConvertByPair & {}

export const COIN_TYPES_LIST = [
  CoinType.BTC,
  CoinType.ETH,
  CoinType.USDT,
  CoinType.USDC,
  CoinType.NGN,
  CoinType.USDT_TRON,
  CoinType.USD

];

