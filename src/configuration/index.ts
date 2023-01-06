import { LogLevel } from "@nestjs/common";

require("dotenv").config()

function getEnv(variable: string, optional: boolean = false) {
  if (process.env[variable] === undefined) {
    if (optional) {
      console.warn(`[@env]: Environmental variable for ${variable} is not supplied. \n So a default value will be generated for you.`);
    } else {
      throw new Error(`You must create an environment variable for ${variable}`);
    }
  }

  return process.env[variable]?.replace(/\\n/gm, '\n');
}


// environment
export const env = {
  isDev: String(process.env.NODE_ENV).toLowerCase().includes('dev'),
  isTest: String(process.env.NODE_ENV).toLowerCase().includes('test'),
  isProd: String(process.env.NODE_ENV).toLowerCase().includes('prod'),
  isStaging: String(process.env.NODE_ENV).toLowerCase().includes('staging'),
  env: process.env.NODE_ENV
};


export const PORT = getEnv('PORT')!;
export const MONGO_DB_URL = getEnv('MONGO_DB_URL')!
export const GONDOR_DB_URL = getEnv('GONDOR_DB_URL')
export const JWT_SECRET_KEY = getEnv('JWT_SECRET_KEY')!

export const REDIS_HOST = getEnv('REDIS_HOST')!
export const REDIS_PORT = getEnv('REDIS_PORT')!
export const REDIS_PASSWORD = getEnv('REDIS_PASSWORD')!
export const REDIS_CLIENT_NAME = getEnv('REDIS_CLIENT_NAME')!
export const NODEMAILER_EMAIL_HOST = getEnv('NODEMAILER_EMAIL_HOST', true)!
export const NODEMAILER_EMAIL_PASSWORD = getEnv('NODEMAILER_EMAIL_PASSWORD', true)!
export const NODEMAILER_EMAIL_PORT = getEnv('NODEMAILER_EMAIL_PORT', true)!
export const NODEMAILER_EMAIL_USER = getEnv('NODEMAILER_EMAIL_USER', true)!
export const NODEMAILER_FROM_EMAIL = getEnv('NODEMAILER_FROM_EMAIL', true)!
export const TWILIO_ACCOUNT_SID = getEnv('TWILIO_ACCOUNT_SID', true)!
export const TWILIO_AUTH_TOKEN = getEnv('TWILIO_AUTH_TOKEN', true)!
export const TWILIO_PHONE = getEnv('TWILIO_PHONE', true)!
export const TATUM_API_KEY = getEnv('TATUM_API_KEY')!
export const ADMIN_CYPHER_SECRET = getEnv('ADMIN_CYPHER_SECRET')!
export const TATUM_BASE_URL = getEnv('TATUM_BASE_URL')!
export const GOOGLE_CLIENT_ID = getEnv('GOOGLE_CLIENT_ID', true);
export const GOOGLE_CLIENT_SECRET = getEnv('GOOGLE_CLIENT_SECRET', true)!
export const MAILJET_API_SECRET_KEY = getEnv("MAILJET_API_SECRET_KEY", true)
export const MAILJET_API_PUBLIC_KEY = getEnv("MAILJET_API_PUBLIC_KEY", true)

export const TATUM_WEBHOOK_SECRET = getEnv("TATUM_WEBHOOK_SECRET", true)!

export const TATUM_BTC_MNEMONIC = getEnv("TATUM_BTC_MNEMONIC", true)
export const TATUM_ETH_MNEMONIC = getEnv("TATUM_ETH_MNEMONIC", true)
export const TATUM_TRON_MNEMONIC = getEnv("TATUM_TRON_MNEMONIC", true)

export const TATUM_ETH_XPUB_KEY = getEnv("TATUM_ETH_XPUB_KEY", true)
export const TATUM_TRON_XPUB_KEY = getEnv("TATUM_TRON_XPUB_KEY", true)
export const TATUM_BTC_XPUB_KEY = getEnv("TATUM_BTC_XPUB_KEY", true)

export const TATUM_USDT_ACCOUNT_ID = getEnv('TATUM_USDT_ACCOUNT_ID')!
export const TATUM_USDC_ACCOUNT_ID = getEnv('TATUM_USDC_ACCOUNT_ID')!
export const TATUM_BTC_ACCOUNT_ID = getEnv('TATUM_BTC_ACCOUNT_ID')!
export const TATUM_USDT_TRON_ACCOUNT_ID = getEnv('TATUM_USDT_TRON_ACCOUNT_ID')!
export const TATUM_ETH_ACCOUNT_ID = getEnv("TATUM_ETH_ACCOUNT_ID")

export const WEB_PUSH_PUBLIC_KEY = getEnv("WEB_PUSH_PUBLIC_KEY", true)
export const WEB_PUSH_PRIVATE_KEY = getEnv("WEB_PUSH_PRIVATE_KEY", true)
export const FRONTEND_URL = getEnv("FRONTEND_URL", true)
export const API_URL = getEnv('API_URL', true)
export const WALLET_ENCRYPTION_PRIVATE_KEY = getEnv('WALLET_ENCRYPTION_PRIVATE_KEY', true)
export const WALLET_ENCRYPTION_PUBLIC_KEY = getEnv('WALLET_ENCRYPTION_PUBLIC_KEY', true)
export const WALLET_ENCRYPTION_ALGORITHM = getEnv('WALLET_ENCRYPTION_ALGORITHM', true)
export const MASTER_TRON_MNEMONIC = getEnv('MASTER_TRON_MNEMONIC', true)

export const TATUM_PRIVATE_KEY_USER_ID = getEnv('TATUM_PRIVATE_KEY_USER_ID', true)
export const TATUM_PRIVATE_KEY_USER_NAME = getEnv('TATUM_PRIVATE_KEY_USER_NAME', true)
export const TATUM_PRIVATE_KEY_PIN = getEnv('TATUM_PRIVATE_KEY_PIN', true)

export const TRC_20_TRON_FEE_AMOUNT: string = '14'


export const LOGS_LEVEL = (): LogLevel[] => {

  if (env.isProd) return ['log', 'warn', 'error'];
  return ['error', 'warn', 'log', 'verbose', 'debug'];

}

export const TATUM_CONFIG = {
  headers: {
    "X-API-Key": TATUM_API_KEY,
  },
};

export const TATUM_SDK_API_KEY_CONFIG = {
  apiKey: TATUM_API_KEY
}

export const TATUM_SDK_NETWORK_CONFIG = { testnet: !env.isProd }

// https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/