export enum AUTHENTICATION_ROUTE {
  SIGNUP = "/auth/signup",
  LOGIN = "/auth/login",
  GOOGLE = "/auth/google",
  ISSUE_VERIFICATION_CODE = "/auth/verify-email",
  VERIFY_USER = "/auth/verify-email",
  RESET_PASSWORD = "/auth/reset-password",
  RECOVER_PASSWORD = "/auth/recover-password",
}

export enum ACCOUNT_ROUTE {
  KYC = "/account/kyc",
  UPLOAD_ID_CARD = "/account/upload-id-card",
  TRANSACTION_PIN = "/account/transaction-pin",
  UPLOAD_AVATAR = "/account/avatar"
}

export enum TEST_ROUTE {
  TEST = "/v1/test",
}

export enum WALLET_ROUTE {
  ROUTE = "/wallet",
  SINGLE_ROUTE = "/wallet/:id",
  FUND = "/wallet/fund",
  WITHDRAW = "/wallet/withdraw",
}

export enum TRANSACTION_ROUTE {
  GET = "/transactions",
  GET_SINGLE = "/transactions/:id",
}

export enum NOTIFICATION_ROUTE {
  GET = "/notifications",
  GET_SINGLE = "/notifications/:id",
}
export enum FAUCET_ROUTE {
  ROUTE = "/faucet",
  SINGLE_ROUTE = "/faucet/:id",
  FUND = "/faucet/fund",
}

export enum RATES_ROUTE {
  PRICES = "/rates",
  SINGLE_PRICES = "/rates/single",
  MARKETS = "/rates/markets",
  MARKETS_SINGLE = "/rates/markets/:coin/:baseCurrency/:pricePercentage",
  HISTORICAL_MARKETS_DATA = "/rates/historic-data",
  EXCHANGE_RATE = "/exchange-rate",
}

export enum TRADE_ROUTE {
  BUY = "/trade/buy",
  SELL = "/trade/sell",
  QUICK_TRADE_BUY = '/trade/quick-trade-buy',
  QUICK_TRADE_SELL = '/trade/quick-trade-sell',
  SWAP = "/trade/swap",
  TRANSFER = "/trade/transfer",
}

export enum WEBHOOK_ROUTE {
  ROUTE = "/webhook/tatum",
  INCOMING_TRANSACTION_ROUTE = '/webhook/tatum-incoming-transaction',
  INCOMING_PENDING_TRANSACTION_ROUTE = '/webhook/tatum-pending-transaction'
}


export enum BANK_ROUTE {
  ROUTE = "/bank",
  NIGERIA_ROUTE = "/nigeria-banks",

}

export enum ADMIN_ROUTE {
  SIGNUP_ROUTE = "/signup",
  LOGIN_ROUTE = "/login",
  SINGLE_ROUTE = "/:id",
  ROLES_ROUTE = "/:id/roles",
  IMAGE_ROUTE = "/:id/image",
  TWO_FA_ROUTE = "/:id/two-fa",
  PASSWORD_ROUTE = "/:id/password",
}