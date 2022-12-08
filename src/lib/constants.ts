

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
  firstName?: string;
  lastName?: string;
  username?: string
  email?: string;
  level?: string;
  isBlacklisted?: boolean
  lock?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
};
export const JWT_EXPIRY_TIME: number = 5;
export const SIGNUP_CODE_EXPIRY: number = 600;
export const ONE_HOUR_IN_SECONDS: number = 3600
export const THREE_MIN_IN_SECONDS: number = 60 * 3
export const FIFTEEN_MIN_IN_SECONDS: number = 60 * 15
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
export const EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/990723155356188672/WAv3c_VWVAETzeETVxrKmemCO458jcC6_qwUKyo8KID0mJEmBInl_U1EJ3qnsJIgqE9e'
export const BUY_SELL_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/990725024711331890/vnSnJGTcOaV4hdYN-n1HIo-Wq-Ypi93as-cTVUonxJChV_m6t_PSLyI1c2MWL5yjQMIe'
export const BUY_SELL_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/990725173558775808/T6Et7q4mtl1Rl-W45UAfoFlSYWlaR_x6-PKVVd5ftmiVM3EGMm288Egro2NQkytxV6ai'

export const SWAP_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/990726127851024394/ORIUb74pKspIRL5DFLiPHwHNb3JdvOYeVm5dK-yVjGX9KMCi-Uf_AYylprhXr8jz_MLf'
export const SWAP_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/990726213423218698/p6FFlN_OrhCoPJnrDH2ZhG5pJlIj-wQ0qEG4JcthIzB8rfunCRwYn2bwimkl8PhuNUs-'

export const WITHDRAWAL_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/990726042031378482/zX-9vVzMwrehxFMs71mRGBHogyEsD3uo3s1r16y9kR4n5iOoXZ0b4Ur_8CzT45oFoiPC'
export const WITHDRAWAL_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/990725119288680468/a43in4GFIDXdEA8Sf0upYmsP-yM1Hxj_WPROaTGSiT3ThCzFzmtF-MVDFwv76WQYV6fG'

export const QUICK_TRADE_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/1002226779878084668/ODuLUSeDoU3iCFE0LCASlBqldt2ZeTOgLE3Dj6evV4UQkrg4W13E5giq_sfPES-anGSN'
export const QUICK_TRADE_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/1002226850086518844/nGVMxxCnLAB2DslSItrNdmFOYWpW827wVaKr00OlsmuqNTmS5zTXm8JZlEomp8G-AlV_'

export const ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/1023610121764491294/D8BMqfTSfX9xgPAlEGxVgGZK-SlKby-SRjI_L-MRjBGC9xRZcbNDM-qJrFSyTlRJZsMM'
export const ERROR_REPORTING_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/1023610072066183299/fuALGLejZV0-S4C_d-1p3ffnwW7NmBwW1O8WWxtfKLHpbOsCPUtV426mHI95OG-1QLTL'


export const P2P_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/1027354392166412331/5H5sdHBtqMq_i3aqMjXp2LKcB_rXQumsg2qGUAe3QZBcVmxYtyLI8hLg-IyagXgnd3yi'
export const P2P_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/1027354442711969792/pxed9n76jB2r0fGRsUGm8z-6sTEq8Rjq8aeQvmxc6g3bwklfMoJyorLeTmK-RgYim-2b'
export const ERROR_REPORTER_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/1029503115847794708/N4nKIeVSOSN8fccaC64ksAnRri6tiu5Ed7_qrH4lQ7Pm28_YdM4op5cPBAL6_V0SB15x'
export const ERROR_REPORTER_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/1029503174601613312/oY7tZF_K6IqWCmVNgTze5CgNAyqsFKU_6mUhpGCCsU5zy2CwpxS0snDSEEFQMVAUsmaf'

export const WALLET_CHANNEL_LINK_DEVELOPMENT = 'https://discord.com/api/webhooks/1033441700942712883/xUp9g7-bbd0iW0Owx7KgzceCgzg5WlqLlgNdyXk0p8YEuJQhZGDG9daF1dYnpx2G4Hiz'
export const WALLET_CHANNEL_LINK_PRODUCTION = 'https://discord.com/api/webhooks/1033441841393192992/MahfXAh8IcMi0Ce1E5ii3UNzzHc2TH5bxtanTzJzifsU2ZF0okGym4yA81LML8XMQYZt'


export const TRON_ADDRESS_MONITOR_CHANNEL = 'https://discord.com/api/webhooks/1050242296660119622/Gc3BcSzAJA6Q-m1kqu6tMqrzpNSCs2ammdL0sLB2EKzHue_-thSK9UU-_g8AKUybOG2E'

export interface UserIDDocumentType {
  documentType: string;
  url: string;
}

