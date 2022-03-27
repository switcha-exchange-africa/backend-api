import { Injectable } from "@nestjs/common";
import { Transaction } from "src/core/entities/transaction.entity";

@Injectable()
export class TransactionFactoryService {
  create(data: Transaction) {
    const transaction = new Transaction();
    if (data.userId) transaction.userId = data.userId;
    if (data.walletId) transaction.walletId = data.walletId;
    if (data.txRefId) transaction.txRefId = data.txRefId;
    if (data.currency) transaction.currency = data.currency;
    if (data.signedAmount) transaction.signedAmount = data.signedAmount;
    if (data.amount) transaction.amount = data.amount;
    if (data.type) transaction.type = data.type;
    if (data.subType) transaction.subType = data.subType;
    if (data.user) transaction.user = data.user;
    if (data.status) transaction.status = data.status;
    if (data.balanceAfter) transaction.balanceAfter = data.balanceAfter;
    if (data.balanceBefore) transaction.balanceBefore = data.balanceBefore;
    if (data.rate) transaction.rate = data.rate;
    if (data.customTransactionType) transaction.customTransactionType = data.customTransactionType;
    if (data.createdAt) transaction.createdAt = new Date();
    if (data.updatedAt) transaction.updatedAt = new Date();
    return transaction;
  }
}
