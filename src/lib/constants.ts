

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
export const EXTERNAL_DEPOSIT_CHANNEL_LINK = 'https://discord.com/api/webhooks/990721058694901770/Feu-9cQAM-EuXqZLC2xDMKHX3yPEVGxnclk-wHX4mNoQqnXMOoR1FSlU8No2dV1jiFbo'

export interface UserIDDocumentType {
  documentType: string;
  url: string;
}
