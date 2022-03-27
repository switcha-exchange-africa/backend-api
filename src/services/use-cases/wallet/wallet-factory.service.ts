import { Wallet } from "src/core/entities/wallet.entity";
import { Injectable } from "@nestjs/common";
import { WALLET_STATUS } from "src/lib/constants";

@Injectable()
export class WalletFactoryService {
  create(data: Wallet) {
    const wallet = new Wallet();
    if (data.address) wallet.address = data.address;
    if (data.coin) wallet.coin = data.coin;
    if (data.isBlocked) wallet.isBlocked = data.isBlocked;
    if (data.lastDeposit) wallet.lastDeposit = data.lastDeposit;
    if (data.lastWithdrawal) wallet.lastWithdrawal = data.lastWithdrawal;
    if (data.userId) wallet.userId = data.userId;
    if (data.user) wallet.user = data.user;
    if (data.accountId) wallet.accountId = data.accountId;
    if (data.destinationTag) wallet.destinationTag = data.destinationTag;
    if (data.memo) wallet.memo = data.memo;
    if (data.tatumMessage) wallet.tatumMessage = data.tatumMessage;
    wallet.createdAt = new Date();
    wallet.updatedAt = new Date();
    wallet.status = WALLET_STATUS.ACTIVE;

    return wallet;
  }
}
