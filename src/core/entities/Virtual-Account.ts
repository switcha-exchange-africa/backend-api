import { CoinType } from "../types/coin";

export class VirtualAccount {
    key: string;
    userId: string;
    accountId: string;
    xpub: string;
    mnemonic: string;
    currency: CoinType;
    pendingTransactionSubscriptionId: string;
    incomingTransactionSubscriptionId: string;
    active: boolean;
    frozen: boolean;
}

