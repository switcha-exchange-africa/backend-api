import { Status } from "../types/status";

export class LockedBalance {    
    amount: number;
    userId: string;
    walletId: string;
    orderId: string;
    action: string;
    status: Status

}