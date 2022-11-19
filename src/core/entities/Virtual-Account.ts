import { CoinType } from "../types/coin";

export class VirtualAccount {
    key: string;
    userId: string;
    accountId: string;
    xpub: string;
    mnemonic: string;
    coin: CoinType;
    pendingTransactionSubscriptionId: string;
    incomingTransactionSubscriptionId: string;
    withdrawalTransactionSubscriptionId: string
    active: boolean;
    frozen: boolean;
}

