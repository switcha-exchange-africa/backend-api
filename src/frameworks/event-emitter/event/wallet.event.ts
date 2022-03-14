export class WalletCreatedEvent {
  userId: string
  blockchain: string;
  network: string;
  walletId: string;
  
}

export interface WALLET_PAYLOAD_TYPE extends WalletCreatedEvent {}
