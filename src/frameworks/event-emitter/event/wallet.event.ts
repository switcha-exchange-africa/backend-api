export class WalletCreatedEvent {
  userId: string
  coin: string
  accountId: string
}

export interface WALLET_PAYLOAD_TYPE extends WalletCreatedEvent { }
