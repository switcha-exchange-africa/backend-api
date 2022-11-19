import { Status } from "../types/status";

export class DepositAddress {
    userId: string;
    virtualAccountId: string;
    coin: string;
    status: Status;
    address: string;
    derivationKey: string;
}