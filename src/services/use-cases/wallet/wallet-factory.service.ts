import { Wallet } from "src/core/entities/wallet.entity";
import { Injectable } from "@nestjs/common";
import { WalletDto } from "src/core/dtos/wallet/wallet.dto";

@Injectable()
export class WalletFactoryService {
  createNewWallet(data: WalletDto) {
    const wallet = new Wallet();

    if (data.balance) wallet.balance = data.balance;
    if (data.address) wallet.address = data.address;
    if (data.coinType) wallet.coinType = data.coinType;
    if (data.createdAt) wallet.createdAt = data.createdAt;
    if (data.isBlocked) wallet.isBlocked = data.isBlocked;
    if (data.lastDeposit) wallet.lastDeposit = data.lastDeposit;
    if (data.lastWithdrawal) wallet.lastWithdrawal = data.lastWithdrawal;
    if (data.network) wallet.network = data.network;
    if (data.status) wallet.status = data.status;
    if (data.updatedAt) wallet.updatedAt = data.updatedAt;
    if (data.userId) wallet.userId = data.userId;
    if (data.user) wallet.user = data.user;
    return wallet;
  }
}
