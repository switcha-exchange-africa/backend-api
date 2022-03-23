import { COIN_TYPES } from "src/lib/constants";

export class WalletCreatedEvent {
  userId: string
  blockchain: string;
  network: string;
  coin: string | COIN_TYPES;
  phrase: string
  symbol: string
}

export interface WALLET_PAYLOAD_TYPE extends WalletCreatedEvent { }
