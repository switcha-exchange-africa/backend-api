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
export const CRYPTO_API_KEY = getEnv('CRYPTO_API_KEY')!
export const CRYPTO_API_WALLET_ID = getEnv('CRYPTO_API_WALLET_ID')!
export const MONO_PUBLIC_KEY = getEnv('MONO_PUBLIC_KEY')!
export const MONO_SECRET_KEY = getEnv('MONO_SECRET_KEY')!
export const WALLET_PRIVATE_KEY = getEnv('WALLET_PRIVATE_KEY')!
export const TATUM_API_KEY = getEnv('TATUM_API_KEY')!
export const ADMIN_CYPHER_SECRET = getEnv('ADMIN_CYPHER_SECRET')!
export const TATUM_BASE_URL = getEnv('TATUM_BASE_URL')!
export const API_URL = getEnv('API_URL')
export const TATUM_USDT_ACCOUNT_ID = getEnv('TATUM_USDT_ACCOUNT_ID')!
export const TATUM_USDC_ACCOUNT_ID = getEnv('TATUM_USDC_ACCOUNT_ID')!
export const TATUM_BTC_ACCOUNT_ID = getEnv('TATUM_BTC_ACCOUNT_ID')!
export const TATUM_USDT_TRON_ACCOUNT_ID = getEnv('TATUM_USDT_TRON_ACCOUNT_ID')!


