
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


export enum NETWORK {
  ROPSTEN = "ropsten",
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export class Wallet {
  balance: number;
  lockedBalance: number;
  address: string;
  userId: string;
  accountId: string;
  network: BLOCKCHAIN_NETWORK;
  coin: string;
  status: WALLET_STATUS;
  lastDeposit: number;
  lastWithdrawal: number;
  reference: string
  createdAt: Date;
  updatedAt: Date;
  isBlocked: boolean;
  destinationTag: string;
  memo: string;
  tatumMessage: string;
  xpub: string
  derivationKey: string
  privateKey: string
  isActivated: boolean
}

export enum CryptoPairType {
  ETH_USDT = "ETH/USD",
  BTC_USDT = "BTC/USD",
  BTC_NGN = "BTC/NGN",
  ETH_NGN = "ETH/NGN",
  NGN_USDT = "NGN/USD",
  USDC_NGN = "USDC/NGN",
  USDT_NGN = "USDT/NGN",
}

export const CoinPairList = [
  CryptoPairType.ETH_USDT,
  CryptoPairType.BTC_USDT,
  CryptoPairType.NGN_USDT,
  CryptoPairType.USDC_NGN,
  CryptoPairType.USDT_NGN,
  CryptoPairType.BTC_NGN,
  CryptoPairType.ETH_NGN,

]

export const WalletCleanedData = [
  'balance',
  'lockedBalance',
  'address',
  'userId',
  'network',
  'coin',
  'status',
  'reference',
  'createdAt',
  'updatedAt',
  'isBlocked',
  'destinationTag',
  'memo',
  'tatumMessage',
  'isActivated',
  "_id",
  "id"
]