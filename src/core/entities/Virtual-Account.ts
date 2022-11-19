
export class VirtualAccount {
    key: string;
    userId: string;
    accountId: string;
    xpub: string;
    mnemonic: string;
    coin: string;
    pendingTransactionSubscriptionId: string;
    incomingTransactionSubscriptionId: string;
    withdrawalTransactionSubscriptionId: string
    active: boolean;
    frozen: boolean;
    lastDeposit: number;
    lastWithdrawal: number;
    balance: number;
    lockedBalance: number;

}

