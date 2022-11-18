
export class WalletCreatedEvent {
  userId: string
  fullName: string
  email: string
}

export interface WALLET_PAYLOAD_TYPE extends WalletCreatedEvent { }

export type IWalletSubscription = {
  accountId: string
}