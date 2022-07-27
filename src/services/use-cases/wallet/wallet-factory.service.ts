import { Wallet, WALLET_STATUS } from "src/core/entities/wallet.entity";
import { Injectable } from "@nestjs/common";
import { generateReference } from "src/lib/utils";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class WalletFactoryService {
  create(data: OptionalQuery<Wallet>) {
    const wallet = new Wallet();
    if (data.address) wallet.address = data.address;
    if (data.coin) wallet.coin = data.coin;
    if (data.isBlocked) wallet.isBlocked = data.isBlocked;
    if (data.lastDeposit) wallet.lastDeposit = data.lastDeposit;
    if (data.lastWithdrawal) wallet.lastWithdrawal = data.lastWithdrawal;
    if (data.userId) wallet.userId = data.userId;
    if (data.accountId) wallet.accountId = data.accountId;
    if (data.destinationTag) wallet.destinationTag = data.destinationTag;
    if (data.memo) wallet.memo = data.memo;
    if (data.tatumMessage) wallet.tatumMessage = data.tatumMessage;
    wallet.createdAt = new Date();
    wallet.updatedAt = new Date();
    wallet.status = WALLET_STATUS.ACTIVE;
    wallet.reference = generateReference('general')
    wallet.isBlocked = false
    return wallet;
  }
}
