import { PaginationType } from "src/core/types/database";

export type IGetVirtualAccounts = PaginationType & {
    coin: string
    userId: string;
    accountId: string
    pendingTransactionSubscriptionId: string
    incomingTransactionSubscriptionId: string
    withdrawalTransactionSubscriptionId: string
    active: boolean;
    frozen: boolean;
    email: string
}