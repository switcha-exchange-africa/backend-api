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

export enum NOTIFICATION_ROUTE {
  GET = "/api/notifications",
  GET_SINGLE = "/api/notifications/:id",
}
export enum FAUCET_ROUTE {
  ROUTE = "/api/faucet",
  SINGLE_ROUTE = "/api/faucet/:id",
  FUND = "/api/faucet/fund",
}

export enum RATES_ROUTE {
  PRICES = "/api/rates",
  SINGLE_PRICES = "/api/rates/single",
  MARKETS = "/api/rates/markets",
  MARKETS_SINGLE = "/api/rates/markets/:coin/:baseCurrency/:pricePercentage",
  HISTORICAL_MARKETS_DATA = "/api/rates/historic-data",
  EXCHANGE_RATE = "/api/exchange-rate",
}

export enum TRADE_ROUTE {
  BUY = "/api/trade/buy",
  SELL = "/api/trade/sell",
  QUICK_TRADE_BUY = '/api/trade/quick-trade-buy',
  QUICK_TRADE_SELL = '/api/trade/quick-trade-sell',
  SWAP = "/api/trade/swap",
  TRANSFER = "/api/trade/transfer",
}

export enum WEBHOOK_ROUTE {
  ROUTE = "/api/webhook/tatum",
  INCOMING_TRANSACTION_ROUTE = '/api/webhook/tatum-incoming-transaction',
  INCOMING_PENDING_TRANSACTION_ROUTE = '/api/webhook/tatum-pending-transaction'
}


export enum BANK_ROUTE {
  ROUTE = "/api/bank",
  NIGERIA_ROUTE = "/api/nigeria-banks",

}