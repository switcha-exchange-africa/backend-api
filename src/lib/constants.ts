export enum AUTHENTICATION_ROUTE {
  SIGNUP = '/api/v1/auth/signup',
  LOGIN = '/api/v1/auth/login',
  ISSUE_VERIFICATION_CODE = '/api/v1/auth/verify-email',
  VERIFY_USER = '/api/v1/auth/verify-email',
  RESET_PASSWORD = '/api/v1/auth/reset-password',
  RECOVER_PASSWORD = '/api/v1/auth/recover-password'

}

export enum ACCOUNT_ROUTE {
  KYC = '/api/v1/account/kyc',
  UPLOAD_ID_CARD = '/api/v1/account/upload-id-card',
  TRANSACTION_PIN = '/api/v1/account/transaction-pin'
}

export enum TEST_ROUTE {
  TEST = '/api/v1/test',

}

export enum SwitchaDeviceType {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web'
}

export const SWITCHA_DEVICES = [
  SwitchaDeviceType.IOS,
  SwitchaDeviceType.ANDROID,
  SwitchaDeviceType.WEB
]

export enum USER_LOCK {
  LOCK = 'lock',
  UNLOCK = 'unlock'
}

export const USER_LOCK_LIST = [
  USER_LOCK.LOCK,
  USER_LOCK.UNLOCK,
]

export enum USER_TYPE {
  DRIVER = "driver",
  CLIENT = "client",
  VENDOR = "vendor"
}
export const USER_TYPE_LIST = [
  USER_TYPE.DRIVER,
  USER_TYPE.CLIENT,
  USER_TYPE.VENDOR,

]
export enum USER_SIGNUP_STATUS_TYPE {
  COMPLETED = 'completed',
  PENDING = 'pending',
  FAILED = 'failed'
}
export const USER_SIGNUP_STATUS_TYPE_LIST = [
  USER_SIGNUP_STATUS_TYPE.COMPLETED,
  USER_SIGNUP_STATUS_TYPE.PENDING,
  USER_SIGNUP_STATUS_TYPE.FAILED,

]

export type JWT_USER_PAYLOAD_TYPE = {
  _id?: string
  fullName?: string
  email?: string
  authStatus?: USER_SIGNUP_STATUS_TYPE
  lock?: USER_LOCK
  emailVerified?: string
  verified?: string
}
export const JWT_EXPIRY_TIME: number = 5
export const SIGNUP_CODE_EXPIRY: number = 600
export const INCOMPLETE_AUTH_TOKEN_VALID_TIME: number = 1;


export enum ErrorResponseType {
  FALLBACK_ERROR = 'fallback-error',
  SIGNUP_ERROR = 'signup-error',
  INVALID_REQUEST_BODY = 'invalid-request-body',
  ISSUANCE_ERROR = "issuance-error",
  VENDOR_ERROR = "vendor-error",
  VERIFICATION_EMAIL_ERROR = "email-verification-error",
  VERIFICATION_PHONE_ERROR = "phone-verification-error",
  DRIVER_ERROR = "driver-error"
}


// redis

export enum RedisPrefix {
  signupEmailCode = 'switcha/signupEmailcode',
  signupPhoneCode = 'switcha/signupPhonecode',
  businessInvitationCode = "switcha/businessInvitationCode",
  passwordResetCount = "switcha/passwordResetCount",
  phoneCodeCount = "switcha/phoneCodeCount",
  resetCode = "switcha/resetCode",
  phoneVerificationCode = "switcha/phoneVerificationCode",
  resetpassword = "switcha/resetpassword",
  changeEmailResetCount = "switcha/changeEmailResetCount",
  emailResetCode = "switcha/emailResetCode"
}
export const RESET_PASSWORD_EXPIRY = 600

export enum VERIFICATION_VALUE_TYPE {
  TRUE = 'true',
  FALSE = 'false'
}
export const VERIFICATION_VALUE_TYPE_LIST = [
  VERIFICATION_VALUE_TYPE.TRUE,
  VERIFICATION_VALUE_TYPE.FALSE

]

export enum BLOCKCHAIN_NETWORK {
  TRC_20 = 'TRC-20',
  ERC_20 = 'ERC-20'
}

export const BLOCKCHAIN_NETWORK_LIST = [
  BLOCKCHAIN_NETWORK.TRC_20,
  BLOCKCHAIN_NETWORK.ERC_20
]

export enum WALLET_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export const WALLET_STATUS_LIST = [
  WALLET_STATUS.ACTIVE,
  WALLET_STATUS.INACTIVE
] 

export enum COIN_TYPES {
  BTC = 'bitcoin',
  ETH = 'ethereum',
  USDT = 'tether',
  NGN = 'naira'
}

export const COIN_TYPES_LIST = [
  COIN_TYPES.BTC,
  COIN_TYPES.ETH,
  COIN_TYPES.USDT,
  COIN_TYPES.NGN
]

export const PLATFORM_NAME = 'switcha'
export const GITHUB_LINK = 'https://github.com/switcha-exchange-africa/backend-api'
export const DISCORD_VERIFICATION_CHANNEL_LINK = 'https://discord.com/api/webhooks/942105718755045416/Mg84Lp40RtoVYzbZkdwG1Rfnuv_vd7cwAwJ2cz8p-ODOEFmB0Vow8zjNDYg2i7BLcwRx'

export interface UserIDDocumentType{
  documentType: string,
  url: string
}


