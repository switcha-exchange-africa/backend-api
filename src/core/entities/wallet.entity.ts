
export enum BLOCKCHAIN_NETWORK {
  BITCOIN = "bitcoin",
  ETHEREUM = "ethereum",
  TRON = "tron",
}

export const BLOCKCHAIN_NETWORK_LIST = [
  BLOCKCHAIN_NETWORK.BITCOIN,
  BLOCKCHAIN_NETWORK.ETHEREUM,
  BLOCKCHAIN_NETWORK.TRON,
];

export enum WALLET_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const WALLET_STATUS_LIST = [
  WALLET_STATUS.ACTIVE,
  WALLET_STATUS.INACTIVE,
];

export enum CoinType {
  BTC = "BTC",
  ETH = "ETH",
  USDT = "USDT",
  USDC = "USDC",
  USDT_TRON = "USDT_TRON",
  NGN = "NGN",
  USD = "USD",
}

export enum BLOCKCHAIN_CHAIN {
  SOL = "SOL",
  ETH = "ETH",
  MATIC = "MATIC",
  KLAY = "KLAY",
  CELO = "CELO",
  BTC = "BTC",
  LTC = "LTC",
  LUNA = "LUNA",
  BCH = "BCH",
  DOGE = "DOGE",
  TRON = "TRON",
}

export const COIN_TYPES_LIST = [
  CoinType.BTC,
  CoinType.ETH,
  CoinType.USDT,
  CoinType.USDC,
  CoinType.NGN,
  CoinType.USDT_TRON,
  CoinType.USD

];

export enum NETWORK {
  ROPSTEN = "ropsten",
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export class Wallet {
  address: string;
  accountId: string;
  userId: string;
  network: BLOCKCHAIN_NETWORK;
  coin: string;
  status: WALLET_STATUS;
  lastDeposit: number;
  lastWithdrawal: number;
  createdAt: Date;
  updatedAt: Date;
  isBlocked: boolean;
  destinationTag: string;
  memo: string;
  tatumMessage: string;
  reference: string
}

export enum CryptoPairType {
  ETH_USDT = "ETH/USDT",
  BTC_USDT = "BTC/USDT",
  NGN_USDT = "NGN/USDT",
  USDC_NGN = "USDC/NGN",
  USDT_NGN = "USDT/NGN",
}

export const CoinPairList = [
  CryptoPairType.ETH_USDT,
  CryptoPairType.BTC_USDT,
  CryptoPairType.NGN_USDT,
  CryptoPairType.USDC_NGN,
  CryptoPairType.USDT_NGN,
  
]