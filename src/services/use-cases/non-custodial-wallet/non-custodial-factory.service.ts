import { Injectable } from "@nestjs/common";
import { VirtualAccount } from "src/core/entities/Virtual-Account";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class VirtualAccountFactoryService {
  create(data: OptionalQuery<VirtualAccount>) {
    const account = new VirtualAccount();
    if (data.userId) account.userId = data.userId;
    if (data.key) account.key = data.key;
    if (data.accountId) account.accountId = data.accountId;
    if (data.pendingTransactionSubscriptionId) account.pendingTransactionSubscriptionId = data.pendingTransactionSubscriptionId;
    if (data.incomingTransactionSubscriptionId) account.incomingTransactionSubscriptionId = data.incomingTransactionSubscriptionId;
    if (data.xpub) account.xpub = data.xpub;
    if (data.mnemonic) account.mnemonic = data.mnemonic;
    if (data.active) account.active = data.active;
    if (data.frozen) account.frozen = data.frozen;
    if (data.currency) account.currency = data.currency;

    

    return account;
  }
}
