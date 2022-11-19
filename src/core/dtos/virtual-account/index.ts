import { IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";
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

export class DepositVirtualAccountDto {
    @IsNotEmpty()
    @IsString()
    public readonly coin: string

}
export type IDepositVirtualAccount = DepositVirtualAccountDto & {
    email: string
    userId: string
    id: Types.ObjectId
}