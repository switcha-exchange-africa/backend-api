export enum AUTHENTICATION_ROUTE {
  SIGNUP = "/api/v1/auth/signup",
  LOGIN = "/api/v1/auth/login",
  ISSUE_VERIFICATION_CODE = "/api/v1/auth/verify-email",
  VERIFY_USER = "/api/v1/auth/verify-email",
  RESET_PASSWORD = "/api/v1/auth/reset-password",
  RECOVER_PASSWORD = "/api/v1/auth/recover-password",
}

export enum ACCOUNT_ROUTE {
  KYC = "/api/v1/account/kyc",
  UPLOAD_ID_CARD = "/api/v1/account/upload-id-card",
  TRANSACTION_PIN = "/api/v1/account/transaction-pin",
}

export enum TEST_ROUTE {
  TEST = "/api/v1/test",
}

export enum WALLET_ROUTE {
  ROUTE = "/api/wallet",
  SINGLE_ROUTE = "/api/wallet/:id"
}

export enum TRANSACTION_ROUTE {
  GET = "/api/transactions",
  GET_SINGLE = "/api/transactions/:id"
}

export enum FAUCET_ROUTE {
  ROUTE = "/api/faucet",
  FUND = "/api/faucet/fund"
}

export enum RATES_ROUTE {
  PRICES = "/api/rates",
  SINGLE_PRICES = "/api/rates/:asset",
  MARKETS = "/api/rates/markets",
  MARKETS_SINGLE = "/api/rates/markets/:coin/:baseCurrency/:pricePercentage",
  HISTORICAL_MARKETS_DATA = "/api/rates/historic-data"
}

export enum TRADE_ROUTE {
  BUY = "/api/trade/buy",
  SELL = "/api/trade/sell",
  SWAP = "/api/trade/swap"
}

export enum WEBHOOK_ROUTE {
  ROUTE = "/api/webhook/tatum"
}

export enum SwitchaDeviceType {
  IOS = "ios",
  ANDROID = "android",
  WEB = "web",
}

export const SWITCHA_DEVICES = [
  SwitchaDeviceType.IOS,
  SwitchaDeviceType.ANDROID,
  SwitchaDeviceType.WEB,
];

export enum USER_LOCK {
  LOCK = "lock",
  UNLOCK = "unlock",
}

export const USER_LOCK_LIST = [USER_LOCK.LOCK, USER_LOCK.UNLOCK];

export enum USER_TYPE {
  DRIVER = "driver",
  CLIENT = "client",
  VENDOR = "vendor",
}
export const USER_TYPE_LIST = [
  USER_TYPE.DRIVER,
  USER_TYPE.CLIENT,
  USER_TYPE.VENDOR,
];
export enum USER_SIGNUP_STATUS_TYPE {
  COMPLETED = "completed",
  PENDING = "pending",
  FAILED = "failed",
}
export const USER_SIGNUP_STATUS_TYPE_LIST = [
  USER_SIGNUP_STATUS_TYPE.COMPLETED,
  USER_SIGNUP_STATUS_TYPE.PENDING,
  USER_SIGNUP_STATUS_TYPE.FAILED,
];

export type JWT_USER_PAYLOAD_TYPE = {
  _id?: string;
  fullName?: string;
  email?: string;
  authStatus?: USER_SIGNUP_STATUS_TYPE;
  lock?: USER_LOCK;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};
export const JWT_EXPIRY_TIME: number = 5;
export const SIGNUP_CODE_EXPIRY: number = 600;
export const INCOMPLETE_AUTH_TOKEN_VALID_TIME: number = 1;

export enum ErrorResponseType {
  FALLBACK_ERROR = "fallback-error",
  SIGNUP_ERROR = "signup-error",
  INVALID_REQUEST_BODY = "invalid-request-body",
  ISSUANCE_ERROR = "issuance-error",
  VENDOR_ERROR = "vendor-error",
  VERIFICATION_EMAIL_ERROR = "email-verification-error",
  VERIFICATION_PHONE_ERROR = "phone-verification-error",
  DRIVER_ERROR = "driver-error",
}

// redis

export enum RedisPrefix {
  signupEmailCode = "switcha/signupEmailcode",
  signupPhoneCode = "switcha/signupPhonecode",
  businessInvitationCode = "switcha/businessInvitationCode",
  passwordResetCount = "switcha/passwordResetCount",
  phoneCodeCount = "switcha/phoneCodeCount",
  resetCode = "switcha/resetCode",
  phoneVerificationCode = "switcha/phoneVerificationCode",
  resetpassword = "switcha/resetpassword",
  changeEmailResetCount = "switcha/changeEmailResetCount",
  emailResetCode = "switcha/emailResetCode",
}
export const RESET_PASSWORD_EXPIRY = 600;

export enum USER_LEVEL_TYPE {
  ONE = "one",
  TWO = "two",
  THREE = "three",
}
export const USER_LEVEL_LIST = [
  USER_LEVEL_TYPE.ONE,
  USER_LEVEL_TYPE.TWO,
  USER_LEVEL_TYPE.THREE,
];

export enum BLOCKCHAIN_NETWORK {
  BITCOIN = "bitcoin",
  ETHEREUM = "ethereum",
  TRON = "tron"
}

export const BLOCKCHAIN_NETWORK_LIST = [
  BLOCKCHAIN_NETWORK.BITCOIN,
  BLOCKCHAIN_NETWORK.ETHEREUM,
  BLOCKCHAIN_NETWORK.TRON
];

export enum WALLET_STATUS {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export const WALLET_STATUS_LIST = [
  WALLET_STATUS.ACTIVE,
  WALLET_STATUS.INACTIVE,
];

export enum COIN_TYPES {
  BTC = "BTC",
  ETH = "ETH",
  USDT = "USDT",
  USDC = "USDC",
  USDT_TRON = "USDT_TRON",
  NGN = "NGN",
}


export const COIN_TYPES_LIST = [
  COIN_TYPES.BTC,
  COIN_TYPES.ETH,
  COIN_TYPES.USDT,
  COIN_TYPES.USDC,
  COIN_TYPES.NGN,
];




export enum NETWORK {
  ROPSTEN = "ropsten",
  TESTNET = "testnet",
  MAINNET = "mainnet",
}

export enum TRANSACTION_TYPE {
  DEBIT = "debit",
  CREDIT = "credit",
}

export const TRANSACTION_TYPE_LIST = [
  TRANSACTION_TYPE.DEBIT,
  TRANSACTION_TYPE.CREDIT
]

export enum TRANSACTION_SUBTYPE {
  DEBIT = "debit",
  CREDIT = "credit",
  FEE = "fee",
  REVERSAL = "reversal",
}

export const TRANSACTION_SUBTYPE_LIST = [
  TRANSACTION_SUBTYPE.DEBIT,
  TRANSACTION_SUBTYPE.CREDIT,
  TRANSACTION_SUBTYPE.FEE,
  TRANSACTION_SUBTYPE.REVERSAL
]

export enum TRANSACTION_STATUS {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export const TRANSACTION_STATUS_LIST = [
  TRANSACTION_STATUS.PENDING,
  TRANSACTION_STATUS.COMPLETED,
  TRANSACTION_STATUS.REJECTED
]

export enum CUSTOM_TRANSACTION_TYPE {
  DEPOSIT = 'deposit',
  BUY = 'buy',
  SELL = 'sell',
  WITHDRAWAL = 'withdrawal',
  P2P = 'p2p',
  SWAP = 'swap',
  FAUCET = 'faucet'
}

export const CUSTOM_TRANSACTION_TYPES = [
  CUSTOM_TRANSACTION_TYPE.DEPOSIT,
  CUSTOM_TRANSACTION_TYPE.BUY,
  CUSTOM_TRANSACTION_TYPE.SELL,
  CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
  CUSTOM_TRANSACTION_TYPE.P2P,
  CUSTOM_TRANSACTION_TYPE.SWAP,
  CUSTOM_TRANSACTION_TYPE.FAUCET
]

export const PLATFORM_NAME = "switcha";
export const GITHUB_LINK =
  "https://github.com/switcha-exchange-africa/backend-api";
export const DISCORD_VERIFICATION_CHANNEL_LINK =
  "https://discord.com/api/webhooks/942105718755045416/Mg84Lp40RtoVYzbZkdwG1Rfnuv_vd7cwAwJ2cz8p-ODOEFmB0Vow8zjNDYg2i7BLcwRx";

export interface UserIDDocumentType {
  documentType: string;
  url: string;
}
