export enum AUTHENTICATION_ROUTE {
  SIGNUP = "/api/auth/signup",
  LOGIN = "/api/auth/login",
  GOOGLE = "/api/auth/google",
  ISSUE_VERIFICATION_CODE = "/api/auth/verify-email",
  VERIFY_USER = "/api/auth/verify-email",
  RESET_PASSWORD = "/api/auth/reset-password",
  RECOVER_PASSWORD = "/api/auth/recover-password",
}

export enum ACCOUNT_ROUTE {
  KYC = "/api/account/kyc",
  UPLOAD_ID_CARD = "/api/account/upload-id-card",
  TRANSACTION_PIN = "/api/account/transaction-pin",
  UPLOAD_AVATAR = "/api/account/avatar"
}

export enum TEST_ROUTE {
  TEST = "/api/v1/test",
}

export enum WALLET_ROUTE {
  ROUTE = "/api/wallet",
  SINGLE_ROUTE = "/api/wallet/:id",
  FUND = "/api/wallet/fund",
  WITHDRAW = "/api/wallet/withdraw",
}

export enum TRANSACTION_ROUTE {
  GET = "/api/transactions",
  GET_SINGLE = "/api/transactions/:id",
}

export enum FAUCET_ROUTE {
  ROUTE = "/api/faucet",
  SINGLE_ROUTE = "/api/faucet/:id",
  FUND = "/api/faucet/fund",
}

export enum RATES_ROUTE {
  PRICES = "/api/rates",
  SINGLE_PRICES = "/api/rates/:asset",
  MARKETS = "/api/rates/markets",
  MARKETS_SINGLE = "/api/rates/markets/:coin/:baseCurrency/:pricePercentage",
  HISTORICAL_MARKETS_DATA = "/api/rates/historic-data",
  EXCHANGE_RATE = "/api/exchange-rate",
}

export enum TRADE_ROUTE {
  BUY = "/api/trade/buy",
  SELL = "/api/trade/sell",
  SWAP = "/api/trade/swap",
  TRANSFER = "/api/trade/transfer",
}

export enum WEBHOOK_ROUTE {
  ROUTE = "/api/webhook/tatum",
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




export const PLATFORM_NAME = "switcha";
export const GITHUB_LINK =
  "https://github.com/switcha-exchange-africa/backend-api";
export const DISCORD_VERIFICATION_CHANNEL_LINK =
  "https://discord.com/api/webhooks/942105718755045416/Mg84Lp40RtoVYzbZkdwG1Rfnuv_vd7cwAwJ2cz8p-ODOEFmB0Vow8zjNDYg2i7BLcwRx";

export interface UserIDDocumentType {
  documentType: string;
  url: string;
}
